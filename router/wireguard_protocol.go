package main

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"log"
	"net/netip"
	"strings"
	"sync"
	"time"

	"golang.org/x/crypto/curve25519"
	"golang.zx2c4.com/wireguard/conn"
	"golang.zx2c4.com/wireguard/device"
)

type wireGuardProtocol struct{}

type wireGuardIdentity struct {
	Private [32]byte
	Public  [32]byte
}

type wireGuardPeer struct {
	Name     string
	Identity wireGuardIdentity
	Addr     netip.Addr
}

type wireGuardInstance struct {
	cfg      protocolConfig
	overlay  overlayConfig
	serverID wireGuardIdentity
	peers    []wireGuardPeer
	frontend *frontendBind
	device   *device.Device
}

type frontendBind struct {
	inner    conn.Bind
	logger   *peerObservationLog
	selector backendSelector
}

type backendSelector interface {
	SelectInbound(packet []byte, ep conn.Endpoint, meta packetMetadata) string
}

type singleBackendSelector struct {
	backendName string
}

type peerObservationLog struct {
	mu           sync.RWMutex
	byEndpoint   map[string]*peerObservation
	bySenderIdx  map[uint32]string
	byReceiverIx map[uint32]string
}

type peerObservation struct {
	Endpoint          string
	FirstSeen         time.Time
	LastSeen          time.Time
	LastBackend       string
	LastPacketType    string
	LastSenderIndex   uint32
	LastReceiverIndex uint32
	Packets           uint64
}

type packetMetadata struct {
	Type          uint32
	TypeName      string
	SenderIndex   uint32
	ReceiverIndex uint32
	Size          int
}

func (wireGuardProtocol) Name() string {
	return "wireguard"
}

func (wireGuardProtocol) ClientCount(cfg protocolConfig) (int, error) {
	if cfg.WireGuard == nil {
		return 0, fmt.Errorf("wireguard settings are required")
	}
	return cfg.WireGuard.PeerCount, nil
}

func (wireGuardProtocol) ClientSubnet(_ protocolConfig, overlay overlayConfig) (netip.Prefix, error) {
	return overlay.OverlayCIDR, nil
}

func (wireGuardProtocol) Build(build protocolBuild) (protocolInstance, error) {
	serverID, err := generateWireGuardIdentity()
	if err != nil {
		return nil, fmt.Errorf("generate server identity: %w", err)
	}

	peers, err := generateWireGuardPeers(build.Config.InstanceName, build.ClientAddrs)
	if err != nil {
		return nil, fmt.Errorf("generate peers: %w", err)
	}

	frontend := &frontendBind{
		inner: conn.NewDefaultBind(),
		logger: &peerObservationLog{
			byEndpoint:   make(map[string]*peerObservation),
			bySenderIdx:  make(map[uint32]string),
			byReceiverIx: make(map[uint32]string),
		},
		selector: singleBackendSelector{backendName: build.Config.InstanceName},
	}

	logger := device.NewLogger(device.LogLevelVerbose, fmt.Sprintf("userspace-wg[%s]: ", build.Config.InstanceName))
	wgDevice := device.NewDevice(build.OverlayLink.tun.Attach(build.Config.InstanceName, build.ClientAddrs), frontend, logger)

	return &wireGuardInstance{
		cfg:      build.Config,
		overlay:  build.Overlay,
		serverID: serverID,
		peers:    peers,
		frontend: frontend,
		device:   wgDevice,
	}, nil
}

func (i *wireGuardInstance) Name() string {
	return "wireguard"
}

func (i *wireGuardInstance) InstanceName() string {
	return i.cfg.InstanceName
}

func (i *wireGuardInstance) Start() error {
	if err := i.device.IpcSet(renderWireGuardServerIPC(i.cfg, i.serverID, i.peers)); err != nil {
		return fmt.Errorf("configure wireguard device: %w", err)
	}
	if err := i.device.Up(); err != nil {
		return fmt.Errorf("bring wireguard device up: %w", err)
	}
	return nil
}

func (i *wireGuardInstance) Close() {
	if i.device != nil {
		i.device.Close()
	}
	if i.frontend != nil {
		_ = i.frontend.Close()
	}
}

func (i *wireGuardInstance) BootstrapInfo(_ overlayConfig) protocolBootstrapInfo {
	endpoint := fmt.Sprintf("%s:%d", i.cfg.PublicHost, i.cfg.ListenPort)
	profiles := make([]clientProfile, 0, len(i.peers))
	for _, peer := range i.peers {
		profiles = append(profiles, clientProfile{
			Name:   peer.Name,
			Config: renderWireGuardPeerConfig(i.cfg, i.overlay, endpoint, i.serverID, peer),
		})
	}

	info := protocolBootstrapInfo{
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

func (i *wireGuardInstance) StatusInfo(requesterAddr string) protocolStatusInfo {
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
	for _, obs := range i.frontend.logger.Snapshot() {
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

	return protocolStatusInfo{
		DisplayName: "Userspace WireGuard Router",
		Lines:       lines,
	}
}

func generateWireGuardPeers(instanceName string, addrs []netip.Addr) ([]wireGuardPeer, error) {
	peers := make([]wireGuardPeer, 0, len(addrs))
	for idx, addr := range addrs {
		identity, err := generateWireGuardIdentity()
		if err != nil {
			return nil, err
		}
		peers = append(peers, wireGuardPeer{
			Name:     fmt.Sprintf("%s-peer-%d", instanceName, idx+1),
			Identity: identity,
			Addr:     addr,
		})
	}

	return peers, nil
}

func generateWireGuardIdentity() (wireGuardIdentity, error) {
	var private [32]byte
	if _, err := rand.Read(private[:]); err != nil {
		return wireGuardIdentity{}, err
	}

	private[0] &= 248
	private[31] &= 127
	private[31] |= 64

	publicKey, err := curve25519.X25519(private[:], curve25519.Basepoint)
	if err != nil {
		return wireGuardIdentity{}, err
	}

	var public [32]byte
	copy(public[:], publicKey)

	return wireGuardIdentity{
		Private: private,
		Public:  public,
	}, nil
}

func renderWireGuardServerIPC(cfg protocolConfig, serverID wireGuardIdentity, peers []wireGuardPeer) string {
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

func renderWireGuardPeerConfig(cfg protocolConfig, overlay overlayConfig, endpoint string, serverID wireGuardIdentity, peer wireGuardPeer) string {
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

func (s singleBackendSelector) SelectInbound(_ []byte, _ conn.Endpoint, _ packetMetadata) string {
	return s.backendName
}

func (b *frontendBind) Open(port uint16) ([]conn.ReceiveFunc, uint16, error) {
	receiveFns, actualPort, err := b.inner.Open(port)
	if err != nil {
		return nil, 0, err
	}

	wrapped := make([]conn.ReceiveFunc, 0, len(receiveFns))
	for _, receiveFn := range receiveFns {
		current := receiveFn
		wrapped = append(wrapped, func(packets [][]byte, sizes []int, eps []conn.Endpoint) (int, error) {
			n, err := current(packets, sizes, eps)
			for i := 0; i < n; i++ {
				if sizes[i] <= 0 || sizes[i] > len(packets[i]) || eps[i] == nil {
					continue
				}
				packet := packets[i][:sizes[i]]
				meta := parsePacketMetadata(packet)
				backend := b.selector.SelectInbound(packet, eps[i], meta)
				b.logger.Record(eps[i], backend, meta)
			}
			return n, err
		})
	}

	return wrapped, actualPort, nil
}

func (b *frontendBind) Close() error {
	return b.inner.Close()
}

func (b *frontendBind) SetMark(mark uint32) error {
	return b.inner.SetMark(mark)
}

func (b *frontendBind) Send(bufs [][]byte, ep conn.Endpoint) error {
	return b.inner.Send(bufs, ep)
}

func (b *frontendBind) ParseEndpoint(s string) (conn.Endpoint, error) {
	return b.inner.ParseEndpoint(s)
}

func (b *frontendBind) BatchSize() int {
	return b.inner.BatchSize()
}

func (l *peerObservationLog) Record(ep conn.Endpoint, backend string, meta packetMetadata) {
	key := ep.DstToString()
	now := time.Now().UTC()

	l.mu.Lock()
	defer l.mu.Unlock()

	entry, ok := l.byEndpoint[key]
	if !ok {
		entry = &peerObservation{
			Endpoint:  key,
			FirstSeen: now,
		}
		l.byEndpoint[key] = entry
	}

	entry.LastSeen = now
	entry.LastBackend = backend
	entry.LastPacketType = meta.TypeName
	entry.LastSenderIndex = meta.SenderIndex
	entry.LastReceiverIndex = meta.ReceiverIndex
	entry.Packets++

	if meta.SenderIndex != 0 {
		l.bySenderIdx[meta.SenderIndex] = key
	}
	if meta.ReceiverIndex != 0 {
		l.byReceiverIx[meta.ReceiverIndex] = key
	}

	log.Printf(
		"frontend: endpoint=%s backend=%s packet_type=%s size=%d sender_idx=%d receiver_idx=%d",
		key,
		backend,
		meta.TypeName,
		meta.Size,
		meta.SenderIndex,
		meta.ReceiverIndex,
	)
}

func (l *peerObservationLog) Snapshot() []peerObservation {
	l.mu.RLock()
	defer l.mu.RUnlock()

	out := make([]peerObservation, 0, len(l.byEndpoint))
	for _, entry := range l.byEndpoint {
		out = append(out, *entry)
	}
	return out
}

func parsePacketMetadata(packet []byte) packetMetadata {
	meta := packetMetadata{
		TypeName: "unknown",
		Size:     len(packet),
	}
	if len(packet) < 4 {
		return meta
	}

	meta.Type = binary.LittleEndian.Uint32(packet[:4])
	switch meta.Type {
	case device.MessageInitiationType:
		meta.TypeName = "handshake-initiation"
		if len(packet) >= device.MessageInitiationSize {
			meta.SenderIndex = binary.LittleEndian.Uint32(packet[4:8])
		}
	case device.MessageResponseType:
		meta.TypeName = "handshake-response"
		if len(packet) >= device.MessageResponseSize {
			meta.SenderIndex = binary.LittleEndian.Uint32(packet[4:8])
			meta.ReceiverIndex = binary.LittleEndian.Uint32(packet[8:12])
		}
	case device.MessageCookieReplyType:
		meta.TypeName = "cookie-reply"
		if len(packet) >= device.MessageCookieReplySize {
			meta.ReceiverIndex = binary.LittleEndian.Uint32(packet[4:8])
		}
	case device.MessageTransportType:
		meta.TypeName = "transport"
		if len(packet) >= device.MessageTransportHeaderSize {
			meta.ReceiverIndex = binary.LittleEndian.Uint32(packet[4:8])
		}
	default:
		meta.TypeName = fmt.Sprintf("unknown-%d", meta.Type)
	}

	return meta
}
