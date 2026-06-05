package router

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/netip"
	"os"
	"strconv"
	"strings"
	"time"

	controlplanepb "proto/gen/go/controlplane"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/protobuf/types/known/timestamppb"
)

const (
	controlPlaneAddrEnv    = "ROUTER_CONTROL_PLANE_ADDR"
	routerIDEnv            = "ROUTER_ID"
	routerVersionEnv       = "ROUTER_VERSION"
	routerLabelsEnv        = "ROUTER_LABELS"
	controlPlaneTimeoutEnv = "ROUTER_CONTROL_PLANE_TIMEOUT"
)

type controlPlaneClient struct {
	addr   string
	router *controlplanepb.RouterInfo
	conn   *grpc.ClientConn
	client controlplanepb.RouterControlPlaneClient
}

type configurationWatch struct {
	stream controlplanepb.RouterControlPlane_WatchRouterConfigurationClient
	cancel context.CancelFunc
}

func (w *configurationWatch) Close() {
	if w != nil && w.cancel != nil {
		w.cancel()
	}
}

func (c *controlPlaneClient) ReportConnections(ctx context.Context, revision string, reports []PeerConnectionReport) error {
	if len(reports) == 0 {
		return nil
	}

	callCtx, cancel := context.WithTimeout(ctx, controlPlaneRequestTimeout())
	defer cancel()

	stream, err := c.client.ReportRouterEvents(callCtx)
	if err != nil {
		return fmt.Errorf("open router event stream to %s: %w", c.addr, err)
	}

	observedAt := time.Now().UTC()
	for _, report := range reports {
		event := &controlplanepb.RouterEvent{
			RouterId:              c.router.GetRouterId(),
			ConfigurationRevision: revision,
			ObservedAt:            timestamppb.New(observedAt),
			Event: &controlplanepb.RouterEvent_WireguardConnection{
				WireguardConnection: connectionLogFromReport(report),
			},
		}
		if err := stream.Send(event); err != nil {
			return fmt.Errorf("send router connection event: %w", err)
		}
	}

	response, err := stream.CloseAndRecv()
	if err != nil {
		return fmt.Errorf("close router event stream: %w", err)
	}
	log.Printf("reported %d router connection events, control plane accepted %d", len(reports), response.GetAcceptedEvents())
	return nil
}

func connectionLogFromReport(report PeerConnectionReport) *controlplanepb.WireGuardConnectionLog {
	state := controlplanepb.PeerConnectionState_PEER_CONNECTION_STATE_DISCONNECTED
	if report.Connected {
		state = controlplanepb.PeerConnectionState_PEER_CONNECTION_STATE_CONNECTED
	}

	rxBytes := report.RxBytes
	txBytes := report.TxBytes
	log := &controlplanepb.WireGuardConnectionLog{
		NetworkId:          report.NetworkID,
		ProtocolInstanceId: report.ProtocolInstanceID,
		PeerId:             report.PeerID,
		Endpoint:           report.Endpoint,
		State:              state,
		RxBytes:            &rxBytes,
		TxBytes:            &txBytes,
	}
	if !report.LatestHandshakeAt.IsZero() {
		log.LatestHandshakeAt = timestamppb.New(report.LatestHandshakeAt)
	}
	return log
}

func loadControlPlaneClientFromEnv() (*controlPlaneClient, error) {
	addr := strings.TrimSpace(os.Getenv(controlPlaneAddrEnv))
	if addr == "" {
		return nil, fmt.Errorf("%s is required", controlPlaneAddrEnv)
	}

	conn, err := grpc.NewClient(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, fmt.Errorf("create gRPC client for %s: %w", addr, err)
	}

	return &controlPlaneClient{
		addr:   addr,
		router: buildRouterInfo(),
		conn:   conn,
		client: controlplanepb.NewRouterControlPlaneClient(conn),
	}, nil
}

func buildRouterInfo() *controlplanepb.RouterInfo {
	hostname, _ := os.Hostname()
	routerID := strings.TrimSpace(os.Getenv(routerIDEnv))
	if routerID == "" {
		routerID = hostname
	}
	version := strings.TrimSpace(os.Getenv(routerVersionEnv))
	if version == "" {
		version = "dev"
	}

	return &controlplanepb.RouterInfo{
		RouterId:           routerID,
		Hostname:           hostname,
		Version:            version,
		SupportedProtocols: registeredProtocolNames(),
		Labels:             parseLabels(os.Getenv(routerLabelsEnv)),
	}
}

func parseLabels(raw string) map[string]string {
	labels := map[string]string{}
	for _, part := range strings.Split(raw, ",") {
		key, value, ok := strings.Cut(part, "=")
		if !ok {
			continue
		}
		key = strings.TrimSpace(key)
		if key == "" {
			continue
		}
		labels[key] = strings.TrimSpace(value)
	}
	return labels
}

func (c *controlPlaneClient) Close() error {
	if c == nil || c.conn == nil {
		return nil
	}
	return c.conn.Close()
}

func (c *controlPlaneClient) LoadInitialConfig(ctx context.Context) (Config, string, *configurationWatch, error) {
	watch, err := c.openConfigWatch(ctx, "")
	if err != nil {
		return Config{}, "", nil, err
	}

	cfg, revision, err := recvConfigUpdateWithTimeout(ctx, watch.stream, controlPlaneRequestTimeout())
	if err != nil {
		watch.Close()
		return Config{}, "", nil, fmt.Errorf("receive initial router configuration from %s: %w", c.addr, err)
	}
	return cfg, revision, watch, nil
}

func (c *controlPlaneClient) Watch(
	ctx context.Context,
	currentRevision string,
	watch *configurationWatch,
	apply func(Config, string) error,
) error {
	if watch == nil {
		var err error
		watch, err = c.openConfigWatch(ctx, currentRevision)
		if err != nil {
			return err
		}
	}
	defer watch.Close()

	for {
		cfg, revision, err := recvConfigUpdate(watch.stream)
		if err != nil {
			return err
		}
		if err := apply(cfg, revision); err != nil {
			return err
		}
	}
}

func (c *controlPlaneClient) openConfigWatch(
	ctx context.Context,
	currentRevision string,
) (*configurationWatch, error) {
	watchCtx, cancel := context.WithCancel(ctx)
	stream, err := c.client.WatchRouterConfiguration(watchCtx, &controlplanepb.WatchRouterConfigurationRequest{
		Router:          c.router,
		CurrentRevision: currentRevision,
	})
	if err != nil {
		cancel()
		return nil, fmt.Errorf("open configuration watch to %s: %w", c.addr, err)
	}
	return &configurationWatch{
		stream: stream,
		cancel: cancel,
	}, nil
}

func recvConfigUpdate(
	stream controlplanepb.RouterControlPlane_WatchRouterConfigurationClient,
) (Config, string, error) {
	for {
		update, err := stream.Recv()
		if err != nil {
			return Config{}, "", err
		}
		snapshot := update.GetConfiguration()
		if snapshot == nil {
			continue
		}
		cfg, err := configFromControlPlane(snapshot)
		if err != nil {
			return Config{}, "", err
		}
		revision := snapshot.GetRevision()
		if revision == "" {
			revision = update.GetRevision()
		}
		return cfg, revision, nil
	}
}

func recvConfigUpdateWithTimeout(
	ctx context.Context,
	stream controlplanepb.RouterControlPlane_WatchRouterConfigurationClient,
	timeout time.Duration,
) (Config, string, error) {
	type result struct {
		cfg      Config
		revision string
		err      error
	}

	resultCh := make(chan result, 1)
	go func() {
		cfg, revision, err := recvConfigUpdate(stream)
		resultCh <- result{cfg: cfg, revision: revision, err: err}
	}()

	timer := time.NewTimer(timeout)
	defer timer.Stop()

	select {
	case <-ctx.Done():
		return Config{}, "", ctx.Err()
	case <-timer.C:
		return Config{}, "", fmt.Errorf("timed out after %s", timeout)
	case result := <-resultCh:
		return result.cfg, result.revision, result.err
	}
}

func controlPlaneRequestTimeout() time.Duration {
	raw := strings.TrimSpace(os.Getenv(controlPlaneTimeoutEnv))
	if raw == "" {
		return 10 * time.Second
	}
	timeout, err := time.ParseDuration(raw)
	if err == nil {
		return timeout
	}
	seconds, err := strconv.Atoi(raw)
	if err != nil {
		return 10 * time.Second
	}
	return time.Duration(seconds) * time.Second
}

func configFromControlPlane(snapshot *controlplanepb.RouterConfiguration) (Config, error) {
	if snapshot == nil {
		return Config{}, fmt.Errorf("control plane returned nil router configuration")
	}

	overlays := make([]OverlayConfig, 0, len(snapshot.GetNetworks()))
	peersByNetworkID := make(map[string][]*controlplanepb.PeerConfig)
	validNetworkIDs := make(map[string]struct{}, len(snapshot.GetNetworks()))

	for _, network := range snapshot.GetNetworks() {
		if network.GetId() == "" {
			log.Printf("skipping invalid control plane network: missing id")
			continue
		}
		if _, exists := validNetworkIDs[network.GetId()]; exists {
			log.Printf("skipping invalid control plane network %q: duplicate id", network.GetId())
			continue
		}
		overlayCIDR, err := netip.ParsePrefix(network.GetCidr())
		if err != nil {
			log.Printf("skipping invalid control plane network %q: parse cidr %q: %v", network.GetId(), network.GetCidr(), err)
			continue
		}
		serverAddr, err := netip.ParseAddr(network.GetServerAddress())
		if err != nil {
			log.Printf("skipping invalid control plane network %q: parse server address %q: %v", network.GetId(), network.GetServerAddress(), err)
			continue
		}
		mtu := int(network.GetMtu())
		if mtu == 0 {
			mtu = defaultMTU
		}
		statusPortValue := int(network.GetStatusPort())
		if statusPortValue == 0 {
			statusPortValue = statusPort
		}
		if !overlayCIDR.Contains(serverAddr) {
			log.Printf("skipping invalid control plane network %q: server address %s is outside overlay %s", network.GetId(), serverAddr, overlayCIDR)
			continue
		}
		if mtu < 1280 {
			log.Printf("skipping invalid control plane network %q: MTU %d must be >= 1280", network.GetId(), mtu)
			continue
		}
		if statusPortValue < 1 || statusPortValue > 65535 {
			log.Printf("skipping invalid control plane network %q: status port %d must be between 1 and 65535", network.GetId(), statusPortValue)
			continue
		}

		overlays = append(overlays, OverlayConfig{
			NetworkID:   network.GetId(),
			Domain:      network.GetDomain(),
			MTU:         mtu,
			ServerAddr:  serverAddr,
			OverlayCIDR: overlayCIDR,
			StatusPort:  statusPortValue,
			Rules:       trafficRulesFromControlPlane(network.GetRules(), network.GetId()),
		})
		peersByNetworkID[network.GetId()] = network.GetPeers()
		validNetworkIDs[network.GetId()] = struct{}{}
	}

	protocols := make([]ProtocolConfig, 0, len(snapshot.GetProtocols()))
	for _, protocol := range snapshot.GetProtocols() {
		listenPort := protocol.GetListenPort()
		if listenPort > 65535 {
			return Config{}, fmt.Errorf("protocol %q listen port %d is outside uint16 range", protocol.GetId(), listenPort)
		}

		cfg := ProtocolConfig{
			ID:         protocol.GetId(),
			Name:       protocol.GetName(),
			NetworkID:  protocol.GetNetworkId(),
			ListenPort: uint16(listenPort),
			PublicHost: protocol.GetPublicHost(),
			PeerIDs:    protocol.GetPeerIds(),
		}
		if cfg.PublicHost == "" {
			cfg.PublicHost = defaultPublicHost()
		}
		overlay, networkExists := overlayForNetworkID(overlays, protocol.GetNetworkId())
		if !networkExists {
			log.Printf("skipping control plane protocol %q: references missing or invalid network %q", cfg.ID, protocol.GetNetworkId())
			continue
		}

		switch normalizeProtocolName(protocol.GetName()) {
		case "wireguard":
			wg := protocol.GetWireguard()
			peers := selectWireGuardPeers(peersByNetworkID[protocol.GetNetworkId()], protocol.GetPeerIds(), cfg.ID, protocol.GetNetworkId(), overlay.ServerAddr)
			cfg.WireGuard = &WireGuardProtocolConfig{
				KeepaliveSec: int(wg.GetPersistentKeepaliveSeconds()),
				Peers:        peers,
			}
			if cfg.WireGuard.KeepaliveSec == 0 {
				cfg.WireGuard.KeepaliveSec = 25
			}
			if privateKey, err := requiredWireGuardKey(wg.GetInterfacePrivateKey()); err != nil {
				return Config{}, fmt.Errorf("protocol %q private key: %w", cfg.ID, err)
			} else {
				cfg.WireGuard.InterfacePrivateKey = &privateKey
			}
			if publicKey, err := requiredWireGuardKey(wg.GetInterfacePublicKey()); err != nil {
				return Config{}, fmt.Errorf("protocol %q public key: %w", cfg.ID, err)
			} else {
				cfg.WireGuard.InterfacePublicKey = &publicKey
			}
			if len(peers) == 0 {
				log.Printf("skipping control plane protocol %q: no valid wireguard peers", cfg.ID)
				continue
			}
			if len(protocol.GetPeerIds()) > 0 {
				cfg.PeerIDs = wireGuardPeerIDs(peers)
			}
		default:
			return Config{}, fmt.Errorf("unsupported control plane protocol %q", protocol.GetName())
		}

		protocols = append(protocols, cfg)
	}

	cfg := Config{Overlays: overlays, Protocols: protocols}
	if err := validateConfig(cfg); err != nil {
		return Config{}, err
	}
	return cfg, nil
}

func trafficRulesFromControlPlane(
	rules []*controlplanepb.PeerTrafficRuleConfig,
	networkID string,
) []PeerTrafficRuleConfig {
	out := make([]PeerTrafficRuleConfig, 0, len(rules))
	seenRuleIDs := make(map[string]struct{}, len(rules))
	for _, rule := range rules {
		if rule.GetId() == "" {
			log.Printf("skipping invalid control plane rule for network %q: missing id", networkID)
			continue
		}
		if _, exists := seenRuleIDs[rule.GetId()]; exists {
			log.Printf("skipping invalid control plane rule %q for network %q: duplicate id", rule.GetId(), networkID)
			continue
		}
		port, ok := trafficRulePortFromControlPlane(rule)
		if !ok {
			log.Printf("skipping invalid control plane rule %q for network %q: port %d is outside uint16 range", rule.GetId(), networkID, rule.GetPort())
			continue
		}
		seenRuleIDs[rule.GetId()] = struct{}{}
		out = append(out, PeerTrafficRuleConfig{
			ID:          rule.GetId(),
			Source:      trafficRulePeerSelectorFromControlPlane(rule.GetSource()),
			Destination: trafficRulePeerSelectorFromControlPlane(rule.GetDestination()),
			Protocol:    trafficProtocolFromControlPlane(rule.GetProtocol()),
			Port:        port,
		})
	}
	return out
}

func trafficRulePeerSelectorFromControlPlane(
	selector *controlplanepb.PeerTrafficRulePeerSelector,
) PeerTrafficRulePeerSelector {
	if selector == nil || selector.GetAll() {
		return PeerTrafficRulePeerSelector{All: true}
	}
	return PeerTrafficRulePeerSelector{
		PeerIDs: compactStrings(selector.GetPeerIds()),
	}
}

func trafficProtocolFromControlPlane(protocol controlplanepb.TrafficProtocol) TrafficProtocol {
	switch protocol {
	case controlplanepb.TrafficProtocol_TRAFFIC_PROTOCOL_TCP:
		return TrafficProtocolTCP
	case controlplanepb.TrafficProtocol_TRAFFIC_PROTOCOL_UDP:
		return TrafficProtocolUDP
	case controlplanepb.TrafficProtocol_TRAFFIC_PROTOCOL_ICMP:
		return TrafficProtocolICMP
	default:
		return TrafficProtocolAny
	}
}

func trafficRulePortFromControlPlane(rule *controlplanepb.PeerTrafficRuleConfig) (*uint16, bool) {
	if rule.Port == nil {
		return nil, true
	}
	raw := rule.GetPort()
	if raw > 65535 {
		return nil, false
	}
	port := uint16(raw)
	return &port, true
}

func compactStrings(values []string) []string {
	out := make([]string, 0, len(values))
	seen := make(map[string]struct{}, len(values))
	for _, value := range values {
		value = strings.TrimSpace(value)
		if value == "" {
			continue
		}
		if _, exists := seen[value]; exists {
			continue
		}
		seen[value] = struct{}{}
		out = append(out, value)
	}
	return out
}

func selectWireGuardPeers(
	peers []*controlplanepb.PeerConfig,
	peerIDs []string,
	protocolID string,
	networkID string,
	serverAddr netip.Addr,
) []WireGuardPeerConfig {
	allowed := map[string]struct{}{}
	for _, id := range peerIDs {
		allowed[id] = struct{}{}
	}

	out := make([]WireGuardPeerConfig, 0, len(peers))
	seenPeerIDs := make(map[string]struct{}, len(peers))
	for _, peer := range peers {
		if peer.GetId() == "" {
			log.Printf("skipping invalid control plane peer for protocol %q network %q: missing id", protocolID, networkID)
			continue
		}
		if _, exists := seenPeerIDs[peer.GetId()]; exists {
			log.Printf("skipping invalid control plane peer %q for protocol %q network %q: duplicate id", peer.GetId(), protocolID, networkID)
			continue
		}
		if len(allowed) > 0 {
			if _, ok := allowed[peer.GetId()]; !ok {
				continue
			}
		}
		seenPeerIDs[peer.GetId()] = struct{}{}
		wg := peer.GetWireguard()
		if wg == nil {
			continue
		}
		addr, err := netip.ParseAddr(peer.GetAddress())
		if err != nil {
			log.Printf("skipping invalid control plane peer %q for protocol %q network %q: parse address %q: %v", peer.GetId(), protocolID, networkID, peer.GetAddress(), err)
			continue
		}
		if addr == serverAddr {
			log.Printf("skipping invalid control plane peer %q for protocol %q network %q: address %s is the server address", peer.GetId(), protocolID, networkID, addr)
			continue
		}
		publicKey, err := requiredWireGuardKey(wg.GetPublicKey())
		if err != nil {
			log.Printf("skipping invalid control plane peer %q for protocol %q network %q: public key: %v", peer.GetId(), protocolID, networkID, err)
			continue
		}
		presharedKey, err := optionalWireGuardKey(wg.GetPresharedKey())
		if err != nil {
			log.Printf("skipping invalid control plane peer %q for protocol %q network %q: preshared key: %v", peer.GetId(), protocolID, networkID, err)
			continue
		}
		out = append(out, WireGuardPeerConfig{
			ID:           peer.GetId(),
			Domain:       peer.GetDomain(),
			Addr:         addr,
			PublicKey:    publicKey,
			PresharedKey: presharedKey,
		})
	}
	return out
}

func wireGuardPeerIDs(peers []WireGuardPeerConfig) []string {
	ids := make([]string, 0, len(peers))
	for _, peer := range peers {
		ids = append(ids, peer.ID)
	}
	return ids
}

func requiredWireGuardKey(raw []byte) ([32]byte, error) {
	key, err := optionalWireGuardKey(raw)
	if err != nil {
		return [32]byte{}, err
	}
	if key == nil {
		return [32]byte{}, fmt.Errorf("key is required")
	}
	return *key, nil
}

func optionalWireGuardKey(raw []byte) (*[32]byte, error) {
	if len(raw) == 0 {
		return nil, nil
	}
	if len(raw) != 32 {
		return nil, fmt.Errorf("expected 32 bytes, got %d", len(raw))
	}
	var key [32]byte
	copy(key[:], raw)
	return &key, nil
}

func defaultPublicHost() string {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return "127.0.0.1"
	}
	for _, addr := range addrs {
		prefix, err := netip.ParsePrefix(addr.String())
		if err != nil {
			continue
		}
		ip := prefix.Addr()
		if ip.Is4() && !ip.IsLoopback() {
			return ip.String()
		}
	}
	return "127.0.0.1"
}
