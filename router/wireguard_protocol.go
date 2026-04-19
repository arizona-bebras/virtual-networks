package main

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/binary"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"net"
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
	cfg         protocolConfig
	overlayName string
	overlay     overlayConfig
	serverID    wireGuardIdentity
	peers       []wireGuardPeer
	frontend    conn.Bind
	logger      *peerObservationLog
	device      *device.Device
}

type sharedWireGuardEndpoint struct {
	mu                  sync.Mutex
	port                uint16
	inner               conn.Bind
	logger              *peerObservationLog
	receivers           map[*sharedWireGuardBind]struct{}
	receiverByIndex     map[uint32]*sharedWireGuardBind
	dispatchers         []conn.ReceiveFunc
	dispatcherCompleted sync.WaitGroup
}

type sharedWireGuardBind struct {
	parent      *sharedWireGuardEndpoint
	backendName string

	mu        sync.RWMutex
	queues    []chan sharedInboundPacket
	opened    bool
	batchSize int
}

type sharedInboundPacket struct {
	data []byte
	ep   conn.Endpoint
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
	if build.WireGuardBind == nil {
		return nil, fmt.Errorf("wireguard bind is required")
	}
	if build.WireGuardServerID == nil {
		return nil, fmt.Errorf("wireguard server identity is required")
	}

	peers, err := generateWireGuardPeers(build.Config.InstanceName, build.ClientAddrs)
	if err != nil {
		return nil, fmt.Errorf("generate peers: %w", err)
	}

	logger := device.NewLogger(device.LogLevelVerbose, fmt.Sprintf("userspace-wg[%s]: ", build.Config.InstanceName))
	wgDevice := device.NewDevice(build.OverlayLink.tun.Attach(build.Config.InstanceName, build.ClientAddrs), build.WireGuardBind, logger)

	serverID := *build.WireGuardServerID
	sharedBind := build.WireGuardBind.(*sharedWireGuardBind)

	return &wireGuardInstance{
		cfg:         build.Config,
		overlayName: build.OverlayName,
		overlay:     build.Overlay,
		serverID:    serverID,
		peers:       peers,
		frontend:    build.WireGuardBind,
		logger:      sharedBind.parent.logger,
		device:      wgDevice,
	}, nil
}

func (i *wireGuardInstance) Name() string {
	return "wireguard"
}

func (i *wireGuardInstance) InstanceName() string {
	return i.cfg.InstanceName
}

func (i *wireGuardInstance) OverlayName() string {
	return i.overlayName
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

func (i *wireGuardInstance) BootstrapInfo() protocolBootstrapInfo {
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
	for _, obs := range i.logger.SnapshotForBackend(i.cfg.InstanceName) {
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

func sharedWireGuardEndpointKey(cfg protocolConfig) string {
	return fmt.Sprintf("%s|%d", normalizeProtocolName(cfg.Name), cfg.ListenPort)
}

func newSharedWireGuardEndpoint(port uint16) *sharedWireGuardEndpoint {
	return &sharedWireGuardEndpoint{
		port:  port,
		inner: conn.NewDefaultBind(),
		logger: &peerObservationLog{
			byEndpoint:   make(map[string]*peerObservation),
			bySenderIdx:  make(map[uint32]string),
			byReceiverIx: make(map[uint32]string),
		},
		receivers:       make(map[*sharedWireGuardBind]struct{}),
		receiverByIndex: make(map[uint32]*sharedWireGuardBind),
	}
}

func (e *sharedWireGuardEndpoint) NewBind(backendName string) conn.Bind {
	return &sharedWireGuardBind{
		parent:      e,
		backendName: backendName,
	}
}

func (e *sharedWireGuardEndpoint) ensureListeningLocked(port uint16) (uint16, error) {
	if len(e.dispatchers) > 0 {
		return e.port, nil
	}
	if port != 0 && port != e.port {
		return 0, fmt.Errorf("wireguard bind requested port %d but shared endpoint uses %d", port, e.port)
	}

	dispatchers, actualPort, err := e.inner.Open(e.port)
	if err != nil {
		return 0, err
	}
	e.port = actualPort
	e.dispatchers = dispatchers

	for idx, receiveFn := range dispatchers {
		e.dispatcherCompleted.Add(1)
		go e.runDispatcher(idx, receiveFn)
	}

	return actualPort, nil
}

func (e *sharedWireGuardEndpoint) runDispatcher(queueIdx int, receiveFn conn.ReceiveFunc) {
	defer e.dispatcherCompleted.Done()

	maxBatchSize := e.inner.BatchSize()
	if maxBatchSize < 1 {
		maxBatchSize = 1
	}

	buffers := make([][]byte, maxBatchSize)
	for i := range buffers {
		buffers[i] = make([]byte, device.MaxMessageSize)
	}
	sizes := make([]int, maxBatchSize)
	endpoints := make([]conn.Endpoint, maxBatchSize)

	for {
		n, err := receiveFn(buffers, sizes, endpoints)
		if err != nil {
			if errors.Is(err, net.ErrClosed) {
				return
			}
			if netErr, ok := err.(net.Error); ok && !netErr.Temporary() {
				return
			}
			log.Printf("shared wireguard dispatcher[%d]: receive error: %v", queueIdx, err)
			continue
		}

		for i := 0; i < n; i++ {
			if sizes[i] <= 0 || sizes[i] > len(buffers[i]) || endpoints[i] == nil {
				continue
			}

			packet := append([]byte(nil), buffers[i][:sizes[i]]...)
			meta := parsePacketMetadata(packet)
			e.dispatchInbound(queueIdx, packet, endpoints[i], meta)
		}
	}
}

func (e *sharedWireGuardEndpoint) dispatchInbound(queueIdx int, packet []byte, ep conn.Endpoint, meta packetMetadata) {
	targets, backendLabel := e.selectReceivers(meta)
	e.logger.Record(ep, backendLabel, meta)

	for _, target := range targets {
		target.enqueue(queueIdx, sharedInboundPacket{
			data: packet,
			ep:   ep,
		})
	}
}

func (e *sharedWireGuardEndpoint) selectReceivers(meta packetMetadata) ([]*sharedWireGuardBind, string) {
	e.mu.Lock()
	defer e.mu.Unlock()

	if meta.ReceiverIndex != 0 {
		if target := e.receiverByIndex[meta.ReceiverIndex]; target != nil && target.isOpen() {
			return []*sharedWireGuardBind{target}, target.backendName
		}
	}

	targets := make([]*sharedWireGuardBind, 0, len(e.receivers))
	names := make([]string, 0, len(e.receivers))
	for target := range e.receivers {
		if !target.isOpen() {
			continue
		}
		targets = append(targets, target)
		names = append(names, target.backendName)
	}

	return targets, strings.Join(names, ",")
}

func (e *sharedWireGuardEndpoint) trackOutbound(sender *sharedWireGuardBind, bufs [][]byte) {
	e.mu.Lock()
	defer e.mu.Unlock()

	for _, packet := range bufs {
		meta := parsePacketMetadata(packet)
		if meta.SenderIndex == 0 {
			continue
		}
		e.receiverByIndex[meta.SenderIndex] = sender
	}
}

func (b *sharedWireGuardBind) Open(port uint16) ([]conn.ReceiveFunc, uint16, error) {
	b.mu.Lock()
	defer b.mu.Unlock()

	if b.opened {
		return nil, 0, conn.ErrBindAlreadyOpen
	}

	b.parent.mu.Lock()
	actualPort, err := b.parent.ensureListeningLocked(port)
	if err == nil {
		b.parent.receivers[b] = struct{}{}
	}
	queueCount := len(b.parent.dispatchers)
	b.batchSize = b.parent.inner.BatchSize()
	b.parent.mu.Unlock()
	if err != nil {
		return nil, 0, err
	}
	if queueCount == 0 {
		queueCount = 1
	}
	if b.batchSize < 1 {
		b.batchSize = 1
	}

	b.queues = make([]chan sharedInboundPacket, queueCount)
	for i := range b.queues {
		b.queues[i] = make(chan sharedInboundPacket, b.batchSize*2)
	}
	b.opened = true

	receiveFns := make([]conn.ReceiveFunc, 0, len(b.queues))
	for idx := range b.queues {
		receiveFns = append(receiveFns, b.makeReceiveFunc(idx))
	}

	return receiveFns, actualPort, nil
}

func (b *sharedWireGuardBind) makeReceiveFunc(queueIdx int) conn.ReceiveFunc {
	return func(packets [][]byte, sizes []int, eps []conn.Endpoint) (int, error) {
		b.mu.RLock()
		if !b.opened || queueIdx >= len(b.queues) {
			b.mu.RUnlock()
			return 0, net.ErrClosed
		}
		queue := b.queues[queueIdx]
		b.mu.RUnlock()

		first, ok := <-queue
		if !ok {
			return 0, net.ErrClosed
		}

		n := 0
		deliver := func(pkt sharedInboundPacket) {
			copy(packets[n], pkt.data)
			sizes[n] = len(pkt.data)
			eps[n] = pkt.ep
			n++
		}
		deliver(first)

		for n < len(packets) {
			select {
			case pkt, ok := <-queue:
				if !ok {
					return n, nil
				}
				deliver(pkt)
			default:
				return n, nil
			}
		}

		return n, nil
	}
}

func (b *sharedWireGuardBind) Close() error {
	b.mu.Lock()
	if !b.opened {
		b.mu.Unlock()
		return nil
	}
	b.opened = false
	queues := b.queues
	b.queues = nil
	b.mu.Unlock()

	b.parent.mu.Lock()
	delete(b.parent.receivers, b)
	for idx, owner := range b.parent.receiverByIndex {
		if owner == b {
			delete(b.parent.receiverByIndex, idx)
		}
	}
	lastReceiver := len(b.parent.receivers) == 0
	b.parent.mu.Unlock()

	for _, queue := range queues {
		close(queue)
	}

	if lastReceiver {
		if err := b.parent.inner.Close(); err != nil {
			return err
		}
		b.parent.dispatcherCompleted.Wait()

		b.parent.mu.Lock()
		b.parent.dispatchers = nil
		b.parent.receiverByIndex = make(map[uint32]*sharedWireGuardBind)
		b.parent.mu.Unlock()
	}

	return nil
}

func (b *sharedWireGuardBind) SetMark(mark uint32) error {
	return b.parent.inner.SetMark(mark)
}

func (b *sharedWireGuardBind) Send(bufs [][]byte, ep conn.Endpoint) error {
	b.parent.trackOutbound(b, bufs)
	return b.parent.inner.Send(bufs, ep)
}

func (b *sharedWireGuardBind) ParseEndpoint(s string) (conn.Endpoint, error) {
	return b.parent.inner.ParseEndpoint(s)
}

func (b *sharedWireGuardBind) BatchSize() int {
	if b.batchSize > 0 {
		return b.batchSize
	}
	return b.parent.inner.BatchSize()
}

func (b *sharedWireGuardBind) enqueue(queueIdx int, packet sharedInboundPacket) {
	b.mu.RLock()
	defer b.mu.RUnlock()

	if !b.opened || queueIdx >= len(b.queues) {
		return
	}

	select {
	case b.queues[queueIdx] <- packet:
	default:
	}
}

func (b *sharedWireGuardBind) isOpen() bool {
	b.mu.RLock()
	defer b.mu.RUnlock()
	return b.opened
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

func (l *peerObservationLog) SnapshotForBackend(backend string) []peerObservation {
	l.mu.RLock()
	defer l.mu.RUnlock()

	out := make([]peerObservation, 0, len(l.byEndpoint))
	for _, entry := range l.byEndpoint {
		if backend != "" && entry.LastBackend != backend && !strings.Contains(entry.LastBackend, backend) {
			continue
		}
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
