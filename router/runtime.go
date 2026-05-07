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

func (r *Runtime) Start(ctx context.Context) error {
	r.mu.Lock()
	if err := r.startLocked(); err != nil {
		r.mu.Unlock()
		return err
	}
	revision := r.revision
	configWatch := r.configWatch
	r.configWatch = nil
	r.mu.Unlock()

	go r.watchControlPlane(ctx, revision, configWatch)
	go r.reportConnections(ctx)
	return nil
}

func (r *Runtime) startLocked() error {
	for _, protocol := range r.protocols {
		if err := protocol.Start(); err != nil {
			return fmt.Errorf("start %s: %w", protocol.ID(), err)
		}
	}
	for _, overlayCfg := range r.cfg.Overlays {
		overlay := r.overlays[overlayCfg.NetworkID]
		if overlay == nil {
			return fmt.Errorf("network runtime %q is missing", overlayCfg.NetworkID)
		}
		closeStatus, err := startStatusServer(overlay.net, overlay.cfg, overlay.protocols)
		if err != nil {
			return fmt.Errorf("start userspace netstack status server for network %q: %w", overlay.networkID, err)
		}
		r.closers = append(r.closers, closeStatus)
	}
	return nil
}

func (r *Runtime) Close() {
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
	for i := len(r.closers) - 1; i >= 0; i-- {
		_ = r.closers[i]()
	}
	r.closers = nil
	for i := len(r.protocols) - 1; i >= 0; i-- {
		r.protocols[i].Close()
	}
	for _, overlayCfg := range r.cfg.Overlays {
		overlay := r.overlays[overlayCfg.NetworkID]
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
	overlays, protocols, err := buildRuntimeParts(cfg)
	if err != nil {
		return err
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	r.closeCurrentLocked()
	r.cfg = cfg
	r.revision = revision
	r.overlays = overlays
	r.protocols = protocols
	if err := r.startLocked(); err != nil {
		return err
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
