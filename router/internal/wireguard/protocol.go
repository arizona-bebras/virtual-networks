package wireguard

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"net/netip"
	"strings"

	router "router"

	"golang.org/x/crypto/curve25519"
	"golang.zx2c4.com/wireguard/conn"
	"golang.zx2c4.com/wireguard/device"
)

type Protocol struct{}

type peer struct {
	Name     string
	Identity router.WireGuardIdentity
	Addr     netip.Addr
}

type instance struct {
	cfg         router.ProtocolConfig
	overlayName string
	overlay     router.OverlayConfig
	serverID    router.WireGuardIdentity
	peers       []peer
	frontend    conn.Bind
	logger      func(backend string) []router.PeerObservation
	device      *device.Device
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
	return cfg.WireGuard.PeerCount, nil
}

func (Protocol) ClientSubnet(_ router.ProtocolConfig, overlay router.OverlayConfig) (netip.Prefix, error) {
	return overlay.OverlayCIDR, nil
}

func (Protocol) Build(build router.ProtocolBuild) (router.ProtocolInstance, error) {
	if build.WireGuardBind == nil {
		return nil, fmt.Errorf("wireguard bind is required")
	}
	if build.WireGuardServerID == nil {
		return nil, fmt.Errorf("wireguard server identity is required")
	}
	if build.AttachTUN == nil {
		return nil, fmt.Errorf("wireguard TUN attachment is required")
	}
	if build.PeerObservations == nil {
		return nil, fmt.Errorf("wireguard peer observation callback is required")
	}

	peers, err := generatePeers(build.Config.InstanceName, build.ClientAddrs)
	if err != nil {
		return nil, fmt.Errorf("generate peers: %w", err)
	}

	logger := device.NewLogger(device.LogLevelVerbose, fmt.Sprintf("userspace-wg[%s]: ", build.Config.InstanceName))
	wgDevice := device.NewDevice(build.AttachTUN(build.Config.InstanceName, build.ClientAddrs), build.WireGuardBind, logger)

	serverID := *build.WireGuardServerID

	return &instance{
		cfg:         build.Config,
		overlayName: build.OverlayName,
		overlay:     build.Overlay,
		serverID:    serverID,
		peers:       peers,
		frontend:    build.WireGuardBind,
		logger:      build.PeerObservations,
		device:      wgDevice,
	}, nil
}

func (i *instance) Name() string {
	return "wireguard"
}

func (i *instance) InstanceName() string {
	return i.cfg.InstanceName
}

func (i *instance) OverlayName() string {
	return i.overlayName
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
	profiles := make([]router.ClientProfile, 0, len(i.peers))
	for _, peer := range i.peers {
		profiles = append(profiles, router.ClientProfile{
			Name:   peer.Name,
			Config: renderPeerConfig(i.cfg, i.overlay, endpoint, i.serverID, peer),
		})
	}

	info := router.ProtocolBootstrapInfo{
		DisplayName:    "Userspace WireGuard Router",
		ListenEndpoint: endpoint,
		ServerDetails:  []string{fmt.Sprintf("Server public key: %s", encodeBase64(i.serverID.Public[:]))},
		ClientProfiles: profiles,
	}
	if i.cfg.PublicHost == "127.0.0.1" {
		info.Postscript = fmt.Sprintf("Set the public host for %s to your reachable server IP or DNS name before distributing these configs.", i.cfg.InstanceName)
	}

	return info
}

func (i *instance) StatusInfo(requesterAddr string) router.ProtocolStatusInfo {
	lines := []string{
		fmt.Sprintf("listen_port=%d", i.cfg.ListenPort),
		fmt.Sprintf("server_public_key=%s", encodeBase64(i.serverID.Public[:])),
	}
	for _, peer := range i.peers {
		line := fmt.Sprintf("%s=%s", peer.Name, peer.Addr)
		if peer.Addr.String() == strings.Split(requesterAddr, ":")[0] {
			line += " (you)"
		}
		lines = append(lines, line)
	}
	for _, obs := range i.logger(i.cfg.InstanceName) {
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

func generatePeers(instanceName string, addrs []netip.Addr) ([]peer, error) {
	peers := make([]peer, 0, len(addrs))
	for idx, addr := range addrs {
		identity, err := generateIdentity()
		if err != nil {
			return nil, err
		}
		peers = append(peers, peer{
			Name:     fmt.Sprintf("%s-peer-%d", instanceName, idx+1),
			Identity: identity,
			Addr:     addr,
		})
	}
	return peers, nil
}

func generateIdentity() (router.WireGuardIdentity, error) {
	var private [32]byte
	if _, err := rand.Read(private[:]); err != nil {
		return router.WireGuardIdentity{}, err
	}
	private[0] &= 248
	private[31] &= 127
	private[31] |= 64

	publicKey, err := curve25519.X25519(private[:], curve25519.Basepoint)
	if err != nil {
		return router.WireGuardIdentity{}, err
	}

	var public [32]byte
	copy(public[:], publicKey)
	return router.WireGuardIdentity{Private: private, Public: public}, nil
}

func renderServerIPC(cfg router.ProtocolConfig, serverID router.WireGuardIdentity, peers []peer) string {
	var b strings.Builder
	fmt.Fprintf(&b, "private_key=%s\n", hex.EncodeToString(serverID.Private[:]))
	fmt.Fprintf(&b, "listen_port=%d\n", cfg.ListenPort)
	b.WriteString("replace_peers=true\n")
	for _, peer := range peers {
		fmt.Fprintf(&b, "public_key=%s\n", hex.EncodeToString(peer.Identity.Public[:]))
		fmt.Fprintf(&b, "allowed_ip=%s/32\n", peer.Addr)
	}
	return b.String()
}

func renderPeerConfig(cfg router.ProtocolConfig, overlay router.OverlayConfig, endpoint string, serverID router.WireGuardIdentity, peer peer) string {
	return fmt.Sprintf(`[Interface]
PrivateKey = %s
Address = %s/32
DNS = %s

[Peer]
PublicKey = %s
AllowedIPs = %s
Endpoint = %s
PersistentKeepalive = %d`,
		encodeBase64(peer.Identity.Private[:]),
		peer.Addr,
		overlay.ServerAddr,
		encodeBase64(serverID.Public[:]),
		overlay.OverlayCIDR,
		endpoint,
		cfg.WireGuard.KeepaliveSec,
	)
}

func encodeBase64(key []byte) string {
	return base64.StdEncoding.EncodeToString(key)
}
