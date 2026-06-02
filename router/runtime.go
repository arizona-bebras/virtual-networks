package router

import (
	"context"
	"fmt"
	"log"
	"net/netip"
	"os"
	"strconv"
	"strings"
	"time"

	"router/internal/netstack"
	"router/internal/runtimeutil"
	"router/internal/wgshared"

	"golang.zx2c4.com/wireguard/tun"
)

func NewRuntime(ctx context.Context) (*Runtime, error) {
	controlPlane, err := loadControlPlaneClientFromEnv()
	if err != nil {
		return nil, err
	}

	cfg, revision, configWatch, err := controlPlane.LoadInitialConfig(ctx)
	if err != nil {
		_ = controlPlane.Close()
		return nil, fmt.Errorf("load control plane config: %w", err)
	}
	log.Printf("loaded router configuration revision %q from control plane %s", revision, controlPlane.addr)

	overlays, protocols, err := buildRuntimeParts(cfg)
	if err != nil {
		if controlPlane != nil {
			_ = controlPlane.Close()
		}
		configWatch.Close()
		return nil, err
	}

	return &Runtime{
		cfg:          cfg,
		revision:     revision,
		overlays:     overlays,
		protocols:    protocols,
		controlPlane: controlPlane,
		configWatch:  configWatch,
	}, nil
}

func buildRuntimeParts(cfg Config) (map[string]*overlayRuntime, []ProtocolInstance, error) {
	overlays, err := buildOverlayRuntimes(cfg.Overlays)
	if err != nil {
		closeOverlayRuntimes(overlays)
		return nil, nil, err
	}

	protocols, err := buildProtocols(cfg, overlays)
	if err != nil {
		closeOverlayRuntimes(overlays)
		return nil, nil, err
	}
	configureOverlayTrafficRules(cfg, overlays)

	return overlays, protocols, nil
}

func buildOverlayRuntimes(overlays []OverlayConfig) (map[string]*overlayRuntime, error) {
	runtimes := make(map[string]*overlayRuntime, len(overlays))
	for _, overlay := range overlays {
		tun, tnet, err := netstack.Create([]netip.Addr{overlay.ServerAddr}, nil, overlay.MTU)
		if err != nil {
			closeOverlayRuntimes(runtimes)
			return nil, fmt.Errorf("create userspace netstack TUN for network %q: %w", overlay.NetworkID, err)
		}

		runtimes[overlay.NetworkID] = &overlayRuntime{
			networkID: overlay.NetworkID,
			cfg:       overlay,
			tun:       tun,
			net:       tnet,
		}
	}

	return runtimes, nil
}

func closeOverlayRuntimes(overlays map[string]*overlayRuntime) {
	for _, overlay := range overlays {
		if overlay != nil && overlay.tun != nil {
			_ = overlay.tun.Close()
		}
	}
}

func buildProtocols(cfg Config, overlays map[string]*overlayRuntime) ([]ProtocolInstance, error) {
	nextHostBySubnet := make(map[string]int)
	instances := make([]ProtocolInstance, 0, len(cfg.Protocols))
	wireGuardEndpoints := make(map[string]*wgshared.Endpoint)

	for _, protocolCfg := range cfg.Protocols {
		overlay := overlays[protocolCfg.NetworkID]
		if overlay == nil {
			return nil, fmt.Errorf("network runtime %q was not initialized", protocolCfg.NetworkID)
		}

		factory, err := selectTunnelProtocol(protocolCfg.Name)
		if err != nil {
			return nil, fmt.Errorf("select protocol %q: %w", protocolCfg.ID, err)
		}

		clientCount, err := factory.ClientCount(protocolCfg)
		if err != nil {
			return nil, fmt.Errorf("count clients for %q: %w", protocolCfg.ID, err)
		}

		clientSubnet, err := factory.ClientSubnet(protocolCfg, overlay.cfg)
		if err != nil {
			return nil, fmt.Errorf("select client subnet for %q: %w", protocolCfg.ID, err)
		}

		subnetKey := fmt.Sprintf("%s|%s", overlay.networkID, clientSubnet.String())
		clientAddrs, nextHost, err := runtimeutil.AllocateClientAddrs(
			clientSubnet,
			overlay.cfg.ServerAddr,
			clientCount,
			nextHostBySubnet[subnetKey],
		)
		if err != nil {
			return nil, fmt.Errorf("allocate client addresses for %q: %w", protocolCfg.ID, err)
		}
		nextHostBySubnet[subnetKey] = nextHost

		build := ProtocolBuild{
			NetworkID: protocolCfg.NetworkID,
			Overlay:   overlay.cfg,
			Config:    protocolCfg,
			AttachTUN: func(name string, routes []netip.Addr) tun.Device {
				return overlay.tun.Attach(name, routes)
			},
			ClientAddrs: clientAddrs,
		}

		if normalizeProtocolName(protocolCfg.Name) == "wireguard" {
			endpointKey := wgshared.Key(protocolCfg.Name, protocolCfg.ListenPort)
			endpoint := wireGuardEndpoints[endpointKey]
			if endpoint == nil {
				endpoint = wgshared.NewEndpoint(protocolCfg.ListenPort)
				wireGuardEndpoints[endpointKey] = endpoint
			}

			build.WireGuardBind = endpoint.NewBind(protocolCfg.ID)
			build.PeerObservations = func(backend string) []PeerObservation {
				observations := endpoint.SnapshotForBackend(backend)
				out := make([]PeerObservation, 0, len(observations))
				for _, obs := range observations {
					out = append(out, PeerObservation{
						Endpoint:          obs.Endpoint,
						LastBackend:       obs.LastBackend,
						LastPacketType:    obs.LastPacketType,
						LastSenderIndex:   obs.LastSenderIndex,
						LastReceiverIndex: obs.LastReceiverIndex,
						Packets:           obs.Packets,
					})
				}
				if dropped := endpoint.DroppedInboundPackets(backend); dropped > 0 {
					out = append(out, PeerObservation{
						Endpoint:       "shared-bind-queue",
						LastBackend:    backend,
						LastPacketType: "dropped-inbound",
						DroppedPackets: dropped,
					})
				}
				return out
			}
		}

		instance, err := factory.Build(build)
		if err != nil {
			return nil, fmt.Errorf("build protocol %q: %w", protocolCfg.ID, err)
		}
		overlay.protocols = append(overlay.protocols, instance)
		instances = append(instances, instance)
	}

	return instances, nil
}

func configureOverlayTrafficRules(cfg Config, overlays map[string]*overlayRuntime) {
	peerAddrByNetworkID := peerAddrsByNetworkID(cfg.Protocols)
	for _, overlayCfg := range cfg.Overlays {
		overlay := overlays[overlayCfg.NetworkID]
		if overlay == nil || overlay.tun == nil {
			continue
		}
		overlay.tun.SetTrafficRules(netstackTrafficRules(overlayCfg.Rules, peerAddrByNetworkID[overlayCfg.NetworkID]))
	}
}

func peerAddrsByNetworkID(protocols []ProtocolConfig) map[string]map[string]netip.Addr {
	out := make(map[string]map[string]netip.Addr)
	for _, protocol := range protocols {
		if protocol.WireGuard == nil {
			continue
		}
		peers := out[protocol.NetworkID]
		if peers == nil {
			peers = make(map[string]netip.Addr)
			out[protocol.NetworkID] = peers
		}
		for _, peer := range protocol.WireGuard.Peers {
			if peer.ID != "" && peer.Addr.IsValid() {
				peers[peer.ID] = peer.Addr
			}
		}
	}
	return out
}

func netstackTrafficRules(
	rules []PeerTrafficRuleConfig,
	peerAddrsByID map[string]netip.Addr,
) []netstack.TrafficRule {
	out := make([]netstack.TrafficRule, 0, len(rules))
	for _, rule := range rules {
		out = append(out, netstack.TrafficRule{
			Source:      netstackTrafficPeerSelector(rule.Source, peerAddrsByID),
			Destination: netstackTrafficPeerSelector(rule.Destination, peerAddrsByID),
			Protocol:    netstackTrafficProtocol(rule.Protocol),
			Port:        copyTrafficPort(rule.Port),
		})
	}
	return out
}

func netstackTrafficPeerSelector(
	selector PeerTrafficRulePeerSelector,
	peerAddrsByID map[string]netip.Addr,
) netstack.TrafficPeerSelector {
	if selector.All {
		return netstack.TrafficPeerSelector{All: true}
	}
	addrs := make([]netip.Addr, 0, len(selector.PeerIDs))
	seen := make(map[netip.Addr]struct{}, len(selector.PeerIDs))
	for _, peerID := range selector.PeerIDs {
		addr, ok := peerAddrsByID[peerID]
		if !ok || !addr.IsValid() {
			continue
		}
		if _, exists := seen[addr]; exists {
			continue
		}
		seen[addr] = struct{}{}
		addrs = append(addrs, addr)
	}
	return netstack.TrafficPeerSelector{Addrs: addrs}
}

func netstackTrafficProtocol(protocol TrafficProtocol) netstack.TrafficProtocol {
	switch protocol {
	case TrafficProtocolTCP:
		return netstack.TrafficProtocolTCP
	case TrafficProtocolUDP:
		return netstack.TrafficProtocolUDP
	case TrafficProtocolICMP:
		return netstack.TrafficProtocolICMP
	default:
		return netstack.TrafficProtocolAny
	}
}

func copyTrafficPort(port *uint16) *uint16 {
	if port == nil {
		return nil
	}
	value := *port
	return &value
}

func (r *Runtime) Start(ctx context.Context) error {
	r.mu.Lock()
	closers, err := startRuntimeParts(r.cfg, r.overlays, r.protocols)
	if err != nil {
		r.mu.Unlock()
		return err
	}
	closeMetrics, err := startPrometheusExporter(ctx, r)
	if err != nil {
		closeRuntimeParts(r.cfg, r.overlays, r.protocols, closers)
		r.mu.Unlock()
		return err
	}
	r.closers = closers
	r.metricsClose = closeMetrics
	revision := r.revision
	configWatch := r.configWatch
	r.configWatch = nil
	r.mu.Unlock()

	go r.watchControlPlane(ctx, revision, configWatch)
	go r.reportConnections(ctx)
	return nil
}

func startRuntimeParts(
	cfg Config,
	overlays map[string]*overlayRuntime,
	protocols []ProtocolInstance,
) ([]func() error, error) {
	for _, protocol := range protocols {
		if err := protocol.Start(); err != nil {
			closeRuntimeParts(cfg, overlays, protocols, nil)
			return nil, fmt.Errorf("start %s: %w", protocol.ID(), err)
		}
	}
	closers, err := startOverlayServices(cfg, overlays)
	if err != nil {
		closeRuntimeParts(cfg, overlays, protocols, closers)
		return nil, err
	}
	return closers, nil
}

func startOverlayServices(
	cfg Config,
	overlays map[string]*overlayRuntime,
) ([]func() error, error) {
	closers := []func() error{}
	for _, overlayCfg := range cfg.Overlays {
		overlay := overlays[overlayCfg.NetworkID]
		if overlay == nil {
			closeOverlayServices(closers)
			return nil, fmt.Errorf("network runtime %q is missing", overlayCfg.NetworkID)
		}
		closeDNS, err := startDNSResolver(overlay.net, overlay.cfg, cfg.Protocols)
		if err != nil {
			closeOverlayServices(closers)
			return nil, fmt.Errorf("start userspace netstack dns resolver for network %q: %w", overlay.networkID, err)
		}
		closers = append(closers, closeDNS)

		closeStatus, err := startStatusServer(overlay.net, overlay.cfg, overlay.protocols)
		if err != nil {
			closeOverlayServices(closers)
			return nil, fmt.Errorf("start userspace netstack status server for network %q: %w", overlay.networkID, err)
		}
		closers = append(closers, closeStatus)
	}
	return closers, nil
}

func closeOverlayServices(closers []func() error) {
	for i := len(closers) - 1; i >= 0; i-- {
		_ = closers[i]()
	}
}

func (r *Runtime) Close() {
	r.mu.Lock()
	closeMetrics := r.metricsClose
	r.metricsClose = nil
	r.mu.Unlock()

	if closeMetrics != nil {
		_ = closeMetrics()
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	r.closeCurrentLocked()
	if r.controlPlane != nil {
		_ = r.controlPlane.Close()
	}
	if r.configWatch != nil {
		r.configWatch.Close()
		r.configWatch = nil
	}
}

func (r *Runtime) closeCurrentLocked() {
	closeRuntimeParts(r.cfg, r.overlays, r.protocols, r.closers)
	r.closers = nil
}

func closeRuntimeParts(
	cfg Config,
	overlays map[string]*overlayRuntime,
	protocols []ProtocolInstance,
	closers []func() error,
) {
	closeOverlayServices(closers)
	for i := len(protocols) - 1; i >= 0; i-- {
		protocols[i].Close()
	}
	for _, overlayCfg := range cfg.Overlays {
		overlay := overlays[overlayCfg.NetworkID]
		if overlay != nil && overlay.tun != nil {
			_ = overlay.tun.Close()
		}
	}
}

func (r *Runtime) watchControlPlane(ctx context.Context, currentRevision string, initialWatch *configurationWatch) {
	revision := currentRevision
	watch := initialWatch
	for {
		if ctx.Err() != nil {
			if watch != nil {
				watch.Close()
			}
			return
		}

		err := r.controlPlane.Watch(ctx, revision, watch, func(cfg Config, nextRevision string) error {
			if nextRevision == "" || nextRevision == revision {
				return nil
			}
			if err := r.ApplyConfig(cfg, nextRevision); err != nil {
				return err
			}
			revision = nextRevision
			log.Printf("applied router configuration revision %q from control plane", revision)
			return nil
		})
		watch = nil
		if ctx.Err() != nil {
			return
		}
		log.Printf("control plane watch disconnected: %v", err)
		select {
		case <-ctx.Done():
			return
		case <-time.After(5 * time.Second):
		}
	}
}

func (r *Runtime) ApplyConfig(cfg Config, revision string) error {
	if err := validateConfig(cfg); err != nil {
		return err
	}

	r.mu.Lock()
	if canUpdateConfigInPlace(r.cfg, cfg, r.protocols) {
		err := r.applyConfigInPlaceLocked(cfg, revision)
		r.mu.Unlock()
		return err
	}
	r.mu.Unlock()

	nextOverlays, nextProtocols, err := buildRuntimeParts(cfg)
	if err != nil {
		return err
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	previousCfg := r.cfg
	previousRevision := r.revision
	previousOverlays := r.overlays
	previousProtocols := r.protocols
	previousClosers := r.closers

	r.cfg = cfg
	r.revision = revision
	r.overlays = nextOverlays
	r.protocols = nextProtocols
	r.closers = nil

	closeRuntimeParts(previousCfg, previousOverlays, previousProtocols, previousClosers)

	nextClosers, err := startRuntimeParts(r.cfg, r.overlays, r.protocols)
	if err == nil {
		r.closers = nextClosers
		return nil
	}

	restoreOverlays, restoreProtocols, restoreErr := buildRuntimeParts(previousCfg)
	if restoreErr != nil {
		r.closers = nil
		return fmt.Errorf("start replacement config: %w; restore previous config: %v", err, restoreErr)
	}
	restoreClosers, restoreStartErr := startRuntimeParts(previousCfg, restoreOverlays, restoreProtocols)
	if restoreStartErr != nil {
		closeRuntimeParts(previousCfg, restoreOverlays, restoreProtocols, restoreClosers)
		r.closers = nil
		return fmt.Errorf("start replacement config: %w; restart previous config: %v", err, restoreStartErr)
	}
	r.cfg = previousCfg
	r.revision = previousRevision
	r.overlays = restoreOverlays
	r.protocols = restoreProtocols
	r.closers = restoreClosers
	return err
}

func (r *Runtime) applyConfigInPlaceLocked(cfg Config, revision string) error {
	previousCfg := r.cfg
	previousRevision := r.revision
	previousClosers := r.closers

	for _, overlayCfg := range cfg.Overlays {
		if overlay := r.overlays[overlayCfg.NetworkID]; overlay != nil {
			overlay.cfg = overlayCfg
		}
	}

	for _, protocolCfg := range cfg.Protocols {
		protocol := protocolByID(r.protocols, protocolCfg.ID)
		updater, ok := protocol.(ProtocolConfigUpdater)
		if !ok {
			return fmt.Errorf("protocol %q does not support in-place config updates", protocolCfg.ID)
		}
		if err := updater.UpdateConfig(protocolCfg); err != nil {
			r.restoreInPlaceConfigLocked(previousCfg, previousRevision)
			return fmt.Errorf("update protocol %q: %w", protocolCfg.ID, err)
		}
	}
	configureOverlayTrafficRules(cfg, r.overlays)

	r.cfg = cfg
	r.revision = revision
	closeOverlayServices(previousClosers)
	r.closers = nil

	nextClosers, err := startOverlayServices(r.cfg, r.overlays)
	if err == nil {
		r.closers = nextClosers
		return nil
	}

	r.cfg = previousCfg
	r.revision = previousRevision
	r.restoreInPlaceConfigLocked(previousCfg, previousRevision)
	restoreClosers, restoreErr := startOverlayServices(previousCfg, r.overlays)
	if restoreErr != nil {
		r.closers = nil
		return fmt.Errorf("restart overlay services: %w; restore previous overlay services: %v", err, restoreErr)
	}
	r.closers = restoreClosers
	return err
}

func (r *Runtime) restoreInPlaceConfigLocked(cfg Config, revision string) {
	r.cfg = cfg
	r.revision = revision
	for _, overlayCfg := range cfg.Overlays {
		if overlay := r.overlays[overlayCfg.NetworkID]; overlay != nil {
			overlay.cfg = overlayCfg
		}
	}
	for _, protocolCfg := range cfg.Protocols {
		if updater, ok := protocolByID(r.protocols, protocolCfg.ID).(ProtocolConfigUpdater); ok {
			_ = updater.UpdateConfig(protocolCfg)
		}
	}
	configureOverlayTrafficRules(cfg, r.overlays)
}

func canUpdateConfigInPlace(previous Config, next Config, protocols []ProtocolInstance) bool {
	if len(previous.Overlays) != len(next.Overlays) || len(previous.Protocols) != len(next.Protocols) {
		return false
	}
	for _, nextOverlay := range next.Overlays {
		previousOverlay, ok := overlayForNetworkID(previous.Overlays, nextOverlay.NetworkID)
		if !ok {
			return false
		}
		if previousOverlay.MTU != nextOverlay.MTU ||
			previousOverlay.ServerAddr != nextOverlay.ServerAddr ||
			previousOverlay.OverlayCIDR != nextOverlay.OverlayCIDR ||
			previousOverlay.StatusPort != nextOverlay.StatusPort {
			return false
		}
	}
	for _, nextProtocol := range next.Protocols {
		previousProtocol, ok := protocolConfigByID(previous.Protocols, nextProtocol.ID)
		if !ok {
			return false
		}
		if previousProtocol.Name != nextProtocol.Name ||
			previousProtocol.NetworkID != nextProtocol.NetworkID ||
			previousProtocol.ListenPort != nextProtocol.ListenPort ||
			previousProtocol.PublicHost != nextProtocol.PublicHost {
			return false
		}
		if !wireGuardInterfaceKeysEqual(previousProtocol.WireGuard, nextProtocol.WireGuard) {
			return false
		}
		protocol := protocolByID(protocols, nextProtocol.ID)
		if protocol == nil {
			return false
		}
		if _, ok := protocol.(ProtocolConfigUpdater); !ok {
			return false
		}
	}
	return true
}

func wireGuardInterfaceKeysEqual(previous *WireGuardProtocolConfig, next *WireGuardProtocolConfig) bool {
	if previous == nil || next == nil {
		return previous == next
	}
	return configKeysEqual(previous.InterfacePrivateKey, next.InterfacePrivateKey) &&
		configKeysEqual(previous.InterfacePublicKey, next.InterfacePublicKey)
}

func configKeysEqual(previous *[32]byte, next *[32]byte) bool {
	switch {
	case previous == nil && next == nil:
		return true
	case previous == nil || next == nil:
		return false
	default:
		return *previous == *next
	}
}

func protocolConfigByID(protocols []ProtocolConfig, id string) (ProtocolConfig, bool) {
	for _, protocol := range protocols {
		if protocol.ID == id {
			return protocol, true
		}
	}
	return ProtocolConfig{}, false
}

func protocolByID(protocols []ProtocolInstance, id string) ProtocolInstance {
	for _, protocol := range protocols {
		if protocol.ID() == id {
			return protocol
		}
	}
	return nil
}

func (r *Runtime) reportConnections(ctx context.Context) {
	ticker := time.NewTicker(connectionReportInterval())
	defer ticker.Stop()

	for {
		r.reportConnectionSnapshot(ctx)

		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
		}
	}
}

func (r *Runtime) reportConnectionSnapshot(ctx context.Context) {
	reports, revision, err := r.connectionReports()
	if err != nil {
		log.Printf("collect connection reports: %v", err)
		return
	}
	if err := r.controlPlane.ReportConnections(ctx, revision, reports); err != nil {
		log.Printf("report connection events: %v", err)
	}
}

func (r *Runtime) connectionReports() ([]PeerConnectionReport, string, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	reports := []PeerConnectionReport{}
	for _, protocol := range r.protocols {
		reporter, ok := protocol.(ConnectionReporter)
		if !ok {
			continue
		}
		protocolReports, err := reporter.ConnectionReports()
		if err != nil {
			return nil, "", fmt.Errorf("%s: %w", protocol.ID(), err)
		}
		reports = append(reports, protocolReports...)
	}
	return reports, r.revision, nil
}

func connectionReportInterval() time.Duration {
	raw := strings.TrimSpace(os.Getenv("ROUTER_CONNECTION_REPORT_INTERVAL"))
	if raw == "" {
		return 10 * time.Second
	}
	interval, err := time.ParseDuration(raw)
	if err == nil && interval > 0 {
		return interval
	}
	seconds, err := strconv.Atoi(raw)
	if err == nil && seconds > 0 {
		return time.Duration(seconds) * time.Second
	}
	return 10 * time.Second
}
