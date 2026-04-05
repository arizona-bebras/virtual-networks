package main

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/netip"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"golang.org/x/crypto/curve25519"
	"golang.zx2c4.com/wireguard/conn"
	"golang.zx2c4.com/wireguard/device"
	"golang.zx2c4.com/wireguard/tun/netstack"
)

const (
	defaultListenPort = 51820
	defaultMTU        = 1420
	defaultPeerCount  = 3
	statusPort        = 8080
)

type wireGuardIdentity struct {
	Private [32]byte
	Public  [32]byte
}

type peer struct {
	Name     string
	Identity wireGuardIdentity
	Addr     netip.Addr
}

type serverConfig struct {
	ListenPort   uint16
	MTU          int
	PeerCount    int
	ServerAddr   netip.Addr
	OverlayCIDR  netip.Prefix
	PublicHost   string
	KeepaliveSec int
}

type routerRuntime struct {
	cfg      serverConfig
	serverID wireGuardIdentity
	peers    []peer

	frontend *frontendBind
	backend  *backendInstance
}

type backendInstance struct {
	name   string
	device *device.Device
	tun    interface{ Close() error }
	net    *netstack.Net
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

func (s singleBackendSelector) SelectInbound(_ []byte, _ conn.Endpoint, _ packetMetadata) string {
	return s.backendName
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

func main() {
	runtime, err := newRouterRuntime()
	if err != nil {
		log.Fatalf("create router runtime: %v", err)
	}
	defer runtime.close()

	if err := runtime.start(); err != nil {
		log.Fatalf("start router runtime: %v", err)
	}

	printBootstrapInfo(runtime.cfg, runtime.serverID, runtime.peers)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	<-ctx.Done()
	log.Println("shutting down userspace wireguard router")
}

func newRouterRuntime() (*routerRuntime, error) {
	cfg, err := loadConfig()
	if err != nil {
		return nil, fmt.Errorf("load config: %w", err)
	}

	serverID, err := generateIdentity()
	if err != nil {
		return nil, fmt.Errorf("generate server identity: %w", err)
	}

	peers, err := generatePeers(cfg)
	if err != nil {
		return nil, fmt.Errorf("generate peers: %w", err)
	}

	tun, tnet, err := netstack.CreateNetTUN([]netip.Addr{cfg.ServerAddr}, nil, cfg.MTU)
	if err != nil {
		return nil, fmt.Errorf("create userspace netstack TUN: %w", err)
	}

	frontend := &frontendBind{
		inner: conn.NewDefaultBind(),
		logger: &peerObservationLog{
			byEndpoint:   make(map[string]*peerObservation),
			bySenderIdx:  make(map[uint32]string),
			byReceiverIx: make(map[uint32]string),
		},
		selector: singleBackendSelector{backendName: "default"},
	}

	logger := device.NewLogger(device.LogLevelVerbose, "userspace-wg: ")
	wgDevice := device.NewDevice(tun, frontend, logger)

	return &routerRuntime{
		cfg:      cfg,
		serverID: serverID,
		peers:    peers,
		frontend: frontend,
		backend: &backendInstance{
			name:   "default",
			device: wgDevice,
			tun:    tun,
			net:    tnet,
		},
	}, nil
}

func (r *routerRuntime) start() error {
	if err := r.backend.device.IpcSet(renderServerIPC(r.cfg, r.serverID, r.peers)); err != nil {
		return fmt.Errorf("configure wireguard device: %w", err)
	}
	if err := r.backend.device.Up(); err != nil {
		return fmt.Errorf("bring wireguard device up: %w", err)
	}
	if err := startStatusServer(r.backend.net, r.cfg, r.serverID, r.peers, r.frontend.logger); err != nil {
		return fmt.Errorf("start userspace netstack status server: %w", err)
	}
	return nil
}

func (r *routerRuntime) close() {
	if r.backend != nil && r.backend.device != nil {
		r.backend.device.Close()
	}
	if r.backend != nil && r.backend.tun != nil {
		_ = r.backend.tun.Close()
	}
	if r.frontend != nil {
		_ = r.frontend.Close()
	}
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

func loadConfig() (serverConfig, error) {
	overlay, err := parsePrefixEnv("WG_OVERLAY_CIDR", "10.44.0.0/24")
	if err != nil {
		return serverConfig{}, err
	}
	serverAddr, err := parseAddrEnv("WG_SERVER_ADDR", "10.44.0.1")
	if err != nil {
		return serverConfig{}, err
	}
	if !overlay.Contains(serverAddr) {
		return serverConfig{}, fmt.Errorf("server address %s is outside overlay %s", serverAddr, overlay)
	}
	if overlay.Bits() != 24 {
		return serverConfig{}, fmt.Errorf("WG_OVERLAY_CIDR currently supports /24 overlays")
	}

	port, err := parseIntEnv("WG_LISTEN_PORT", defaultListenPort)
	if err != nil {
		return serverConfig{}, err
	}
	mtu, err := parseIntEnv("WG_MTU", defaultMTU)
	if err != nil {
		return serverConfig{}, err
	}
	peerCount, err := parseIntEnv("WG_PEER_COUNT", defaultPeerCount)
	if err != nil {
		return serverConfig{}, err
	}
	keepalive, err := parseIntEnv("WG_KEEPALIVE_SECONDS", 25)
	if err != nil {
		return serverConfig{}, err
	}
	if peerCount < 1 {
		return serverConfig{}, fmt.Errorf("WG_PEER_COUNT must be >= 1")
	}

	publicHost := strings.TrimSpace(os.Getenv("WG_PUBLIC_HOST"))
	if publicHost == "" {
		publicHost = "127.0.0.1"
	}

	return serverConfig{
		ListenPort:   uint16(port),
		MTU:          mtu,
		PeerCount:    peerCount,
		ServerAddr:   serverAddr,
		OverlayCIDR:  overlay,
		PublicHost:   publicHost,
		KeepaliveSec: keepalive,
	}, nil
}

func generatePeers(cfg serverConfig) ([]peer, error) {
	networkBase := cfg.OverlayCIDR.Addr().As4()
	serverIP := cfg.ServerAddr.As4()

	nextHost := 2
	peers := make([]peer, 0, cfg.PeerCount)
	for len(peers) < cfg.PeerCount {
		candidate := netip.AddrFrom4([4]byte{networkBase[0], networkBase[1], networkBase[2], byte(nextHost)})
		nextHost++

		if !cfg.OverlayCIDR.Contains(candidate) {
			return nil, fmt.Errorf("overlay %s does not have enough addresses for %d peers", cfg.OverlayCIDR, cfg.PeerCount)
		}
		if candidate == cfg.ServerAddr || candidate.As4() == serverIP {
			continue
		}

		identity, err := generateIdentity()
		if err != nil {
			return nil, err
		}
		peers = append(peers, peer{
			Name:     fmt.Sprintf("peer-%d", len(peers)+1),
			Identity: identity,
			Addr:     candidate,
		})
	}

	return peers, nil
}

func generateIdentity() (wireGuardIdentity, error) {
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

func renderServerIPC(cfg serverConfig, serverID wireGuardIdentity, peers []peer) string {
	var b strings.Builder
	fmt.Fprintf(&b, "private_key=%s\n", hex.EncodeToString(serverID.Private[:]))
	fmt.Fprintf(&b, "listen_port=%d\n", cfg.ListenPort)
	b.WriteString("replace_peers=true\n")

	for _, p := range peers {
		fmt.Fprintf(&b, "public_key=%s\n", hex.EncodeToString(p.Identity.Public[:]))
		fmt.Fprintf(&b, "allowed_ip=%s/32\n", p.Addr)
	}

	return b.String()
}

func startStatusServer(
	tnet *netstack.Net,
	cfg serverConfig,
	serverID wireGuardIdentity,
	peers []peer,
	observations *peerObservationLog,
) error {
	listener, err := tnet.ListenTCP(&net.TCPAddr{
		IP:   net.IP(cfg.ServerAddr.AsSlice()),
		Port: statusPort,
	})
	if err != nil {
		return err
	}

	go func() {
		_ = http.Serve(listener, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "text/plain; charset=utf-8")
			_, _ = w.Write([]byte(renderStatusBody(cfg, serverID, peers, observations, r.RemoteAddr)))
		}))
	}()

	return nil
}

func renderStatusBody(
	cfg serverConfig,
	serverID wireGuardIdentity,
	peers []peer,
	observations *peerObservationLog,
	requesterAddr string,
) string {
	var b strings.Builder
	fmt.Fprintf(&b, "userspace wireguard router\n")
	fmt.Fprintf(&b, "server_ip=%s\n", cfg.ServerAddr)
	fmt.Fprintf(&b, "listen_port=%d\n", cfg.ListenPort)
	fmt.Fprintf(&b, "overlay=%s\n", cfg.OverlayCIDR)
	fmt.Fprintf(&b, "server_public_key=%s\n", encodeBase64(serverID.Public[:]))
	for _, p := range peers {
		fmt.Fprintf(&b, "%s=%s", p.Name, p.Addr)
		if p.Addr.String() == strings.Split(requesterAddr, ":")[0] {
			fmt.Fprintf(&b, " (you)")
		}
		fmt.Fprintf(&b, "\n")
	}
	for _, obs := range observations.Snapshot() {
		fmt.Fprintf(
			&b,
			"observed endpoint=%s packets=%d last_type=%s backend=%s sender_idx=%d receiver_idx=%d\n",
			obs.Endpoint,
			obs.Packets,
			obs.LastPacketType,
			obs.LastBackend,
			obs.LastSenderIndex,
			obs.LastReceiverIndex,
		)
	}
	return b.String()
}

func printBootstrapInfo(cfg serverConfig, serverID wireGuardIdentity, peers []peer) {
	endpoint := fmt.Sprintf("%s:%d", cfg.PublicHost, cfg.ListenPort)

	fmt.Println("=== Userspace WireGuard Router ===")
	fmt.Printf("Server listen UDP endpoint: %s\n", endpoint)
	fmt.Printf("Server tunnel address: %s/%d\n", cfg.ServerAddr, cfg.OverlayCIDR.Bits())
	fmt.Printf("Server public key: %s\n", encodeBase64(serverID.Public[:]))
	fmt.Printf("Status endpoint inside tunnel: http://%s:%d/\n", cfg.ServerAddr, statusPort)
	fmt.Println("Frontend bind: shared UDP listener with packet metadata logging enabled")
	fmt.Println()
	fmt.Println("Peer configs:")

	for _, p := range peers {
		fmt.Printf("\n# %s\n", p.Name)
		fmt.Println(renderPeerConfig(cfg, endpoint, serverID, p))
	}

	fmt.Println()
	fmt.Println("All peers currently flow through the same backend device and netstack.")
	fmt.Println("The frontend now logs endpoint and WireGuard packet identifiers so tenant routing can be added later.")
	if cfg.PublicHost == "127.0.0.1" {
		fmt.Println("Set WG_PUBLIC_HOST to your reachable server IP or DNS name before distributing these configs.")
	}
}

func renderPeerConfig(cfg serverConfig, endpoint string, serverID wireGuardIdentity, p peer) string {
	return fmt.Sprintf(`[Interface]
PrivateKey = %s
Address = %s/32
DNS = %s

[Peer]
PublicKey = %s
AllowedIPs = %s
Endpoint = %s
PersistentKeepalive = %d`,
		encodeBase64(p.Identity.Private[:]),
		p.Addr,
		cfg.ServerAddr,
		encodeBase64(serverID.Public[:]),
		cfg.OverlayCIDR,
		endpoint,
		cfg.KeepaliveSec,
	)
}

func parseIntEnv(name string, fallback int) (int, error) {
	raw := strings.TrimSpace(os.Getenv(name))
	if raw == "" {
		return fallback, nil
	}
	value, err := strconv.Atoi(raw)
	if err != nil {
		return 0, fmt.Errorf("%s must be an integer: %w", name, err)
	}
	return value, nil
}

func parseAddrEnv(name string, fallback string) (netip.Addr, error) {
	raw := strings.TrimSpace(os.Getenv(name))
	if raw == "" {
		raw = fallback
	}
	addr, err := netip.ParseAddr(raw)
	if err != nil {
		return netip.Addr{}, fmt.Errorf("%s must be a valid IP address: %w", name, err)
	}
	if !addr.Is4() {
		return netip.Addr{}, fmt.Errorf("%s currently supports IPv4 only", name)
	}
	return addr, nil
}

func parsePrefixEnv(name string, fallback string) (netip.Prefix, error) {
	raw := strings.TrimSpace(os.Getenv(name))
	if raw == "" {
		raw = fallback
	}
	prefix, err := netip.ParsePrefix(raw)
	if err != nil {
		return netip.Prefix{}, fmt.Errorf("%s must be a valid CIDR: %w", name, err)
	}
	if !prefix.Addr().Is4() {
		return netip.Prefix{}, fmt.Errorf("%s currently supports IPv4 only", name)
	}
	return prefix.Masked(), nil
}

func encodeBase64(key []byte) string {
	return base64.StdEncoding.EncodeToString(key)
}

func init() {
	log.SetFlags(log.LstdFlags | log.Lmicroseconds)
}
