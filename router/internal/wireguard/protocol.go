package wireguard

import (
	"bufio"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"net/netip"
	"strconv"
	"strings"
	"time"

	router "router"

	"golang.zx2c4.com/wireguard/conn"
	"golang.zx2c4.com/wireguard/device"
)

type Protocol struct{}

type peer struct {
	ID           string
	Identity     router.WireGuardIdentity
	Addr         netip.Addr
	PresharedKey *[32]byte
}

type instance struct {
	cfg       router.ProtocolConfig
	networkID string
	overlay   router.OverlayConfig
	serverID  router.WireGuardIdentity
	peers     []peer
	frontend  conn.Bind
	logger    func(backend string) []router.PeerObservation
	device    *device.Device
}

type peerUAPIStatus struct {
	PublicKey             string
	Endpoint              string
	LatestHandshakeSecond int64
	LatestHandshakeNsec   int64
	RxBytes               uint64
	TxBytes               uint64
}

func init() {
	router.RegisterProtocol(Protocol{})
}

func (Protocol) Name() string {
	return "wireguard"
}

func (Protocol) ClientCount(cfg router.ProtocolConfig) (int, error) {
	if cfg.WireGuard == nil {
		return 0, fmt.Errorf("wireguard settings are required")
	}
	if len(cfg.WireGuard.Peers) == 0 {
		return 0, fmt.Errorf("wireguard peers are required")
	}
	return len(cfg.WireGuard.Peers), nil
}

func (Protocol) ClientSubnet(_ router.ProtocolConfig, overlay router.OverlayConfig) (netip.Prefix, error) {
	return overlay.OverlayCIDR, nil
}

func (Protocol) Build(build router.ProtocolBuild) (router.ProtocolInstance, error) {
	if build.WireGuardBind == nil {
		return nil, fmt.Errorf("wireguard bind is required")
	}
	if build.AttachTUN == nil {
		return nil, fmt.Errorf("wireguard TUN attachment is required")
	}
	if build.PeerObservations == nil {
		return nil, fmt.Errorf("wireguard peer observation callback is required")
	}

	peers, err := selectPeers(build.Config)
	if err != nil {
		return nil, fmt.Errorf("select peers: %w", err)
	}

	logger := device.NewLogger(device.LogLevelError, fmt.Sprintf("userspace-wg[%s]: ", build.Config.ID))
	wgDevice := device.NewDevice(build.AttachTUN(build.Config.ID, peerAddrs(peers)), build.WireGuardBind, logger)

	if build.Config.WireGuard == nil || build.Config.WireGuard.InterfacePrivateKey == nil || build.Config.WireGuard.InterfacePublicKey == nil {
		return nil, fmt.Errorf("wireguard interface private and public keys are required")
	}
	serverID := router.WireGuardIdentity{
		Private: *build.Config.WireGuard.InterfacePrivateKey,
		Public:  *build.Config.WireGuard.InterfacePublicKey,
	}

	return &instance{
		cfg:       build.Config,
		networkID: build.NetworkID,
		overlay:   build.Overlay,
		serverID:  serverID,
		peers:     peers,
		frontend:  build.WireGuardBind,
		logger:    build.PeerObservations,
		device:    wgDevice,
	}, nil
}

func (i *instance) Name() string {
	return "wireguard"
}

func (i *instance) ID() string {
	return i.cfg.ID
}

func (i *instance) NetworkID() string {
	return i.networkID
}

func (i *instance) Start() error {
	if err := i.device.IpcSet(renderServerIPC(i.cfg, i.serverID, i.peers)); err != nil {
		return fmt.Errorf("configure wireguard device: %w", err)
	}
	if err := i.device.Up(); err != nil {
		return fmt.Errorf("bring wireguard device up: %w", err)
	}
	return nil
}

func (i *instance) Close() {
	if i.device != nil {
		i.device.Close()
	}
	if i.frontend != nil {
		_ = i.frontend.Close()
	}
}

func (i *instance) BootstrapInfo() router.ProtocolBootstrapInfo {
	endpoint := fmt.Sprintf("%s:%d", i.cfg.PublicHost, i.cfg.ListenPort)
	info := router.ProtocolBootstrapInfo{
		DisplayName:    "Userspace WireGuard Router",
		ListenEndpoint: endpoint,
		ServerDetails:  []string{fmt.Sprintf("Server public key: %s", encodeBase64(i.serverID.Public[:]))},
	}
	if i.cfg.PublicHost == "127.0.0.1" {
		info.Postscript = fmt.Sprintf("Set the public host for %s to your reachable server IP or DNS name before distributing these configs.", i.cfg.ID)
	}

	return info
}

func (i *instance) StatusInfo(requesterAddr string) router.ProtocolStatusInfo {
	lines := []string{
		fmt.Sprintf("listen_port=%d", i.cfg.ListenPort),
		fmt.Sprintf("server_public_key=%s", encodeBase64(i.serverID.Public[:])),
	}
	for _, peer := range i.peers {
		line := fmt.Sprintf("%s=%s", peer.ID, peer.Addr)
		if peer.Addr.String() == strings.Split(requesterAddr, ":")[0] {
			line += " (you)"
		}
		lines = append(lines, line)
	}
	for _, obs := range i.logger(i.cfg.ID) {
		if obs.DroppedPackets > 0 {
			lines = append(lines, fmt.Sprintf(
				"observed endpoint=%s dropped_packets=%d last_type=%s backend=%s",
				obs.Endpoint,
				obs.DroppedPackets,
				obs.LastPacketType,
				obs.LastBackend,
			))
			continue
		}
		lines = append(lines, fmt.Sprintf(
			"observed endpoint=%s packets=%d last_type=%s backend=%s sender_idx=%d receiver_idx=%d",
			obs.Endpoint,
			obs.Packets,
			obs.LastPacketType,
			obs.LastBackend,
			obs.LastSenderIndex,
			obs.LastReceiverIndex,
		))
	}

	return router.ProtocolStatusInfo{
		DisplayName: "Userspace WireGuard Router",
		Lines:       lines,
	}
}

func (i *instance) ConnectionReports() ([]router.PeerConnectionReport, error) {
	statuses, err := i.peerStatuses()
	if err != nil {
		return nil, err
	}

	byPublicKey := make(map[string]peerUAPIStatus, len(statuses))
	for _, status := range statuses {
		byPublicKey[status.PublicKey] = status
	}

	reports := make([]router.PeerConnectionReport, 0, len(i.peers))
	for _, peer := range i.peers {
		status := byPublicKey[hex.EncodeToString(peer.Identity.Public[:])]
		latestHandshakeAt := time.Time{}
		if status.LatestHandshakeSecond > 0 || status.LatestHandshakeNsec > 0 {
			latestHandshakeAt = time.Unix(status.LatestHandshakeSecond, status.LatestHandshakeNsec).UTC()
		}

		reports = append(reports, router.PeerConnectionReport{
			NetworkID:          i.cfg.NetworkID,
			ProtocolInstanceID: i.cfg.ID,
			PeerID:             peer.ID,
			Endpoint:           status.Endpoint,
			Connected:          !latestHandshakeAt.IsZero() && time.Since(latestHandshakeAt) <= 3*time.Minute,
			LatestHandshakeAt:  latestHandshakeAt,
			RxBytes:            status.RxBytes,
			TxBytes:            status.TxBytes,
		})
	}
	return reports, nil
}

func (i *instance) peerStatuses() ([]peerUAPIStatus, error) {
	if i.device == nil {
		return nil, fmt.Errorf("wireguard device is not initialized")
	}

	raw, err := i.device.IpcGet()
	if err != nil {
		return nil, fmt.Errorf("get wireguard device status: %w", err)
	}
	return parsePeerStatuses(raw)
}

func selectPeers(cfg router.ProtocolConfig) ([]peer, error) {
	if cfg.WireGuard == nil || len(cfg.WireGuard.Peers) == 0 {
		return nil, fmt.Errorf("wireguard peers are required")
	}
	peers := make([]peer, 0, len(cfg.WireGuard.Peers))
	for _, cfgPeer := range cfg.WireGuard.Peers {
		peers = append(peers, peer{
			ID: cfgPeer.ID,
			Identity: router.WireGuardIdentity{
				Public: cfgPeer.PublicKey,
			},
			Addr:         cfgPeer.Addr,
			PresharedKey: cfgPeer.PresharedKey,
		})
	}
	return peers, nil
}

func parsePeerStatuses(raw string) ([]peerUAPIStatus, error) {
	statuses := []peerUAPIStatus{}
	var current *peerUAPIStatus

	scanner := bufio.NewScanner(strings.NewReader(raw))
	for scanner.Scan() {
		line := scanner.Text()
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}

		switch key {
		case "public_key":
			statuses = append(statuses, peerUAPIStatus{PublicKey: value})
			current = &statuses[len(statuses)-1]
		case "endpoint":
			if current != nil {
				current.Endpoint = value
			}
		case "last_handshake_time_sec":
			if current != nil {
				seconds, err := strconv.ParseInt(value, 10, 64)
				if err != nil {
					return nil, fmt.Errorf("parse last handshake seconds %q: %w", value, err)
				}
				current.LatestHandshakeSecond = seconds
			}
		case "last_handshake_time_nsec":
			if current != nil {
				nanos, err := strconv.ParseInt(value, 10, 64)
				if err != nil {
					return nil, fmt.Errorf("parse last handshake nanoseconds %q: %w", value, err)
				}
				current.LatestHandshakeNsec = nanos
			}
		case "rx_bytes":
			if current != nil {
				rxBytes, err := strconv.ParseUint(value, 10, 64)
				if err != nil {
					return nil, fmt.Errorf("parse rx bytes %q: %w", value, err)
				}
				current.RxBytes = rxBytes
			}
		case "tx_bytes":
			if current != nil {
				txBytes, err := strconv.ParseUint(value, 10, 64)
				if err != nil {
					return nil, fmt.Errorf("parse tx bytes %q: %w", value, err)
				}
				current.TxBytes = txBytes
			}
		}
	}
	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("scan wireguard status: %w", err)
	}
	return statuses, nil
}

func peerAddrs(peers []peer) []netip.Addr {
	addrs := make([]netip.Addr, 0, len(peers))
	for _, peer := range peers {
		addrs = append(addrs, peer.Addr)
	}
	return addrs
}

func renderServerIPC(cfg router.ProtocolConfig, serverID router.WireGuardIdentity, peers []peer) string {
	var b strings.Builder
	fmt.Fprintf(&b, "private_key=%s\n", hex.EncodeToString(serverID.Private[:]))
	fmt.Fprintf(&b, "listen_port=%d\n", cfg.ListenPort)
	b.WriteString("replace_peers=true\n")
	for _, peer := range peers {
		fmt.Fprintf(&b, "public_key=%s\n", hex.EncodeToString(peer.Identity.Public[:]))
		if peer.PresharedKey != nil {
			fmt.Fprintf(&b, "preshared_key=%s\n", hex.EncodeToString(peer.PresharedKey[:]))
		}
		fmt.Fprintf(&b, "allowed_ip=%s/32\n", peer.Addr)
	}
	return b.String()
}

func encodeBase64(key []byte) string {
	return base64.StdEncoding.EncodeToString(key)
}
