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

	log := &controlplanepb.WireGuardConnectionLog{
		NetworkId:          report.NetworkID,
		ProtocolInstanceId: report.ProtocolInstanceID,
		PeerId:             report.PeerID,
		Endpoint:           report.Endpoint,
		State:              state,
		RxBytes:            report.RxBytes,
		TxBytes:            report.TxBytes,
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

	for _, network := range snapshot.GetNetworks() {
		if network.GetId() == "" {
			return Config{}, fmt.Errorf("control plane network is missing id")
		}
		overlayCIDR, err := netip.ParsePrefix(network.GetCidr())
		if err != nil {
			return Config{}, fmt.Errorf("parse network %q cidr %q: %w", network.GetId(), network.GetCidr(), err)
		}
		serverAddr, err := netip.ParseAddr(network.GetServerAddress())
		if err != nil {
			return Config{}, fmt.Errorf("parse network %q server address %q: %w", network.GetId(), network.GetServerAddress(), err)
		}
		mtu := int(network.GetMtu())
		if mtu == 0 {
			mtu = defaultMTU
		}
		statusPortValue := int(network.GetStatusPort())
		if statusPortValue == 0 {
			statusPortValue = statusPort
		}

		overlays = append(overlays, OverlayConfig{
			NetworkID:   network.GetId(),
      Domain:      network.GetDomain(),
			MTU:         mtu,
			ServerAddr:  serverAddr,
			OverlayCIDR: overlayCIDR,
			StatusPort:  statusPortValue,
		})
		peersByNetworkID[network.GetId()] = network.GetPeers()
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

		switch normalizeProtocolName(protocol.GetName()) {
		case "wireguard":
			wg := protocol.GetWireguard()
			peers, err := selectWireGuardPeers(peersByNetworkID[protocol.GetNetworkId()], protocol.GetPeerIds())
			if err != nil {
				return Config{}, fmt.Errorf("protocol %q peers: %w", cfg.ID, err)
			}
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

func selectWireGuardPeers(peers []*controlplanepb.PeerConfig, peerIDs []string) ([]WireGuardPeerConfig, error) {
	allowed := map[string]struct{}{}
	for _, id := range peerIDs {
		allowed[id] = struct{}{}
	}

	out := make([]WireGuardPeerConfig, 0, len(peers))
	for _, peer := range peers {
		if len(allowed) > 0 {
			if _, ok := allowed[peer.GetId()]; !ok {
				continue
			}
		}
		wg := peer.GetWireguard()
		if wg == nil {
			continue
		}
		addr, err := netip.ParseAddr(peer.GetAddress())
		if err != nil {
			return nil, fmt.Errorf("parse peer %q address %q: %w", peer.GetId(), peer.GetAddress(), err)
		}
		publicKey, err := requiredWireGuardKey(wg.GetPublicKey())
		if err != nil {
			return nil, fmt.Errorf("peer %q public key: %w", peer.GetId(), err)
		}
		presharedKey, err := optionalWireGuardKey(wg.GetPresharedKey())
		if err != nil {
			return nil, fmt.Errorf("peer %q preshared key: %w", peer.GetId(), err)
		}
		out = append(out, WireGuardPeerConfig{
			ID:           peer.GetId(),
      Domain:       peer.GetDomain(),
			Addr:         addr,
			PublicKey:    publicKey,
			PresharedKey: presharedKey,
		})
	}
	return out, nil
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
