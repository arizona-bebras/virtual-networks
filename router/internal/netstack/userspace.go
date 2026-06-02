package netstack

import (
	"context"
	"fmt"
	"net"
	"net/netip"
	"os"
	"strings"
	"sync"
	"sync/atomic"
	"syscall"

	"golang.zx2c4.com/wireguard/tun"

	"gvisor.dev/gvisor/pkg/buffer"
	"gvisor.dev/gvisor/pkg/tcpip"
	"gvisor.dev/gvisor/pkg/tcpip/adapters/gonet"
	"gvisor.dev/gvisor/pkg/tcpip/header"
	"gvisor.dev/gvisor/pkg/tcpip/link/channel"
	"gvisor.dev/gvisor/pkg/tcpip/network/ipv4"
	"gvisor.dev/gvisor/pkg/tcpip/stack"
	"gvisor.dev/gvisor/pkg/tcpip/transport/icmp"
	"gvisor.dev/gvisor/pkg/tcpip/transport/tcp"
	"gvisor.dev/gvisor/pkg/tcpip/transport/udp"
)

const (
	packetQueueCapacity  = 8192
	rxChecksumOffloadEnv = "ROUTER_NETSTACK_RX_CHECKSUM_OFFLOAD"
)

type Hub struct {
	ep           *channel.Endpoint
	stack        *stack.Stack
	notifyHandle *channel.NotificationHandle
	mtu          int

	mu          sync.RWMutex
	attachments map[*deviceTun]struct{}
	routes      map[netip.Addr]*deviceTun
	policy      trafficPolicy
	closed      bool

	droppedNoRoute       atomic.Uint64
	droppedTUNQueueFull  atomic.Uint64
	droppedInvalidPacket atomic.Uint64
	droppedPolicy        atomic.Uint64
}

type deviceTun struct {
	parent         *Hub
	name           string
	routes         []netip.Addr
	events         chan tun.Event
	incomingPacket chan queuedPacket
}

type queuedPacket struct {
	bytes   []byte
	release func()
}

func (packet queuedPacket) Release() {
	if packet.release != nil {
		packet.release()
	}
}

type Network struct {
	stack *stack.Stack
}

type Stats struct {
	DroppedNoRoute       uint64
	DroppedTUNQueueFull  uint64
	DroppedInvalidPacket uint64
	DroppedPolicy        uint64
	GVisorOutboundQueued int
	TUNQueued            int
}

type TrafficProtocol string

const TrafficProtocolAny TrafficProtocol = ""
const TrafficProtocolTCP TrafficProtocol = "tcp"
const TrafficProtocolUDP TrafficProtocol = "udp"
const TrafficProtocolICMP TrafficProtocol = "icmp"

type TrafficRule struct {
	Source      TrafficPeerSelector
	Destination TrafficPeerSelector
	Protocol    TrafficProtocol
	Port        *uint16
}

type TrafficPeerSelector struct {
	All   bool
	Addrs []netip.Addr
}

type trafficPolicy struct {
	rules []trafficRule
}

type trafficRule struct {
	source      trafficPeerSelector
	destination trafficPeerSelector
	protocol    TrafficProtocol
	port        *uint16
}

type trafficPeerSelector struct {
	all   bool
	addrs map[netip.Addr]struct{}
}

type packetInfo struct {
	source   netip.Addr
	dest     netip.Addr
	protocol TrafficProtocol
	srcPort  *uint16
	destPort *uint16
}

func Create(localAddresses, _ []netip.Addr, mtu int) (*Hub, *Network, error) {
	opts := stack.Options{
		NetworkProtocols:   []stack.NetworkProtocolFactory{ipv4.NewProtocol},
		TransportProtocols: []stack.TransportProtocolFactory{tcp.NewProtocol, udp.NewProtocol, icmp.NewProtocol4},
		HandleLocal:        true,
	}

	dev := &Hub{
		ep:          channel.New(packetQueueCapacity, uint32(mtu), ""),
		stack:       stack.New(opts),
		mtu:         mtu,
		attachments: make(map[*deviceTun]struct{}),
		routes:      make(map[netip.Addr]*deviceTun),
	}
	if rxChecksumOffloadEnabled() {
		dev.ep.LinkEPCapabilities |= stack.CapabilityRXChecksumOffload
	}

	sackEnabledOpt := tcpip.TCPSACKEnabled(true)
	if err := dev.stack.SetTransportProtocolOption(tcp.ProtocolNumber, &sackEnabledOpt); err != nil {
		return nil, nil, fmt.Errorf("enable TCP SACK: %v", err)
	}

	dev.notifyHandle = dev.ep.AddNotify(dev)
	if err := dev.stack.CreateNIC(1, dev.ep); err != nil {
		return nil, nil, fmt.Errorf("create NIC: %v", err)
	}

	hasV4 := false
	for _, ip := range localAddresses {
		if !ip.Is4() {
			return nil, nil, fmt.Errorf("unsupported IPv6 local address: %s", ip)
		}
		hasV4 = true

		protoAddr := tcpip.ProtocolAddress{
			Protocol:          ipv4.ProtocolNumber,
			AddressWithPrefix: tcpip.AddrFromSlice(ip.AsSlice()).WithPrefix(),
		}
		if err := dev.stack.AddProtocolAddress(1, protoAddr, stack.AddressProperties{}); err != nil {
			return nil, nil, fmt.Errorf("add protocol address %s: %v", ip, err)
		}
	}

	if hasV4 {
		if err := dev.stack.SetForwardingDefaultAndAllNICs(ipv4.ProtocolNumber, true); err != nil {
			return nil, nil, fmt.Errorf("enable IPv4 forwarding: %v", err)
		}
		dev.stack.AddRoute(tcpip.Route{Destination: header.IPv4EmptySubnet, NIC: 1})
	}

	return dev, &Network{
		stack: dev.stack,
	}, nil
}

func (hub *Hub) Attach(name string, routes []netip.Addr) tun.Device {
	attached := &deviceTun{
		parent:         hub,
		name:           name,
		routes:         append([]netip.Addr(nil), routes...),
		events:         make(chan tun.Event, 10),
		incomingPacket: make(chan queuedPacket, packetQueueCapacity),
	}

	hub.mu.Lock()
	defer hub.mu.Unlock()

	if hub.closed {
		close(attached.events)
		close(attached.incomingPacket)
		return attached
	}

	hub.attachments[attached] = struct{}{}
	for _, route := range attached.routes {
		hub.routes[route] = attached
	}
	attached.events <- tun.EventUp
	return attached
}

func (hub *Hub) SetTrafficRules(rules []TrafficRule) {
	policy := buildTrafficPolicy(rules)

	hub.mu.Lock()
	hub.policy = policy
	hub.mu.Unlock()
}

func (hub *Hub) WritePacket(packet []byte) error {
	if len(packet) == 0 {
		return nil
	}
	if packet[0]>>4 != 4 {
		return syscall.EAFNOSUPPORT
	}
	if !hub.allowPacket(packet) {
		return nil
	}

	pkb := stack.NewPacketBuffer(stack.PacketBufferOptions{
		Payload: buffer.MakeWithData(packet),
	})
	hub.ep.InjectInbound(header.IPv4ProtocolNumber, pkb)

	return nil
}

func (hub *Hub) allowPacket(packet []byte) bool {
	info, ok := parsePacketInfo(packet)
	if !ok {
		hub.droppedInvalidPacket.Add(1)
		return false
	}

	hub.mu.RLock()
	_, sourceIsPeer := hub.routes[info.source]
	_, destIsPeer := hub.routes[info.dest]
	policy := hub.policy
	hub.mu.RUnlock()

	if !destIsPeer {
		return true
	}
	if !sourceIsPeer {
		hub.droppedPolicy.Add(1)
		return false
	}
	if !policy.allows(info) {
		hub.droppedPolicy.Add(1)
		return false
	}
	return true
}

func buildTrafficPolicy(rules []TrafficRule) trafficPolicy {
	policy := trafficPolicy{
		rules: make([]trafficRule, 0, len(rules)),
	}
	for _, rule := range rules {
		source := trafficPeerSelector{
			all:   rule.Source.All,
			addrs: make(map[netip.Addr]struct{}, len(rule.Source.Addrs)),
		}
		for _, addr := range rule.Source.Addrs {
			if addr.IsValid() {
				source.addrs[addr] = struct{}{}
			}
		}

		destination := trafficPeerSelector{
			all:   rule.Destination.All,
			addrs: make(map[netip.Addr]struct{}, len(rule.Destination.Addrs)),
		}
		for _, addr := range rule.Destination.Addrs {
			if addr.IsValid() {
				destination.addrs[addr] = struct{}{}
			}
		}

		port := rule.Port
		if port != nil {
			value := *port
			port = &value
		}

		policy.rules = append(policy.rules, trafficRule{
			source:      source,
			destination: destination,
			protocol:    rule.Protocol,
			port:        port,
		})
	}
	return policy
}

func (policy trafficPolicy) allows(info packetInfo) bool {
	for _, rule := range policy.rules {
		if rule.matches(info) {
			return true
		}
	}
	return false
}

func (rule trafficRule) matches(info packetInfo) bool {
	if rule.protocol != TrafficProtocolAny && rule.protocol != info.protocol {
		return false
	}

	if rule.source.matches(info.source) &&
		rule.destination.matches(info.dest) &&
		rule.matchesPort(info.srcPort, info.destPort) {
		return true
	}

	return rule.source.matches(info.dest) &&
		rule.destination.matches(info.source) &&
		rule.matchesPort(info.destPort, info.srcPort)
}

func (rule trafficRule) matchesPort(sourcePort, destPort *uint16) bool {
	if rule.port == nil {
		return true
	}
	if destPort != nil && *rule.port == *destPort {
		return true
	}
	return (rule.protocol == TrafficProtocolUDP || rule.protocol == TrafficProtocolAny) &&
		sourcePort != nil &&
		*rule.port == *sourcePort
}

func (selector trafficPeerSelector) matches(addr netip.Addr) bool {
	if selector.all {
		return true
	}
	_, ok := selector.addrs[addr]
	return ok
}

func (hub *Hub) WriteNotify() {
	for {
		pkt := hub.ep.Read()
		if pkt == nil {
			return
		}

		view := pkt.ToView()
		packet := queuedPacket{
			bytes:   view.AsSlice(),
			release: view.Release,
		}
		pkt.DecRef()

		ip := header.IPv4(packet.bytes)
		if !ip.IsValid(len(packet.bytes)) {
			packet.Release()
			hub.droppedInvalidPacket.Add(1)
			continue
		}

		var dstRaw [4]byte
		copy(dstRaw[:], ip.DestinationAddressSlice())
		dst := netip.AddrFrom4(dstRaw)

		hub.mu.RLock()
		attached := hub.routes[dst]
		hub.mu.RUnlock()
		if attached == nil {
			packet.Release()
			hub.droppedNoRoute.Add(1)
			continue
		}

		select {
		case attached.incomingPacket <- packet:
		default:
			packet.Release()
			hub.droppedTUNQueueFull.Add(1)
		}
	}
}

func (hub *Hub) Stats() Stats {
	hub.mu.RLock()
	tunQueued := 0
	for attached := range hub.attachments {
		tunQueued += len(attached.incomingPacket)
	}
	hub.mu.RUnlock()

	return Stats{
		DroppedNoRoute:       hub.droppedNoRoute.Load(),
		DroppedTUNQueueFull:  hub.droppedTUNQueueFull.Load(),
		DroppedInvalidPacket: hub.droppedInvalidPacket.Load(),
		DroppedPolicy:        hub.droppedPolicy.Load(),
		GVisorOutboundQueued: hub.ep.NumQueued(),
		TUNQueued:            tunQueued,
	}
}

func (hub *Hub) Close() error {
	hub.mu.Lock()
	if hub.closed {
		hub.mu.Unlock()
		return nil
	}
	hub.closed = true
	attachments := make([]*deviceTun, 0, len(hub.attachments))
	for attached := range hub.attachments {
		attachments = append(attachments, attached)
		delete(hub.attachments, attached)
	}
	hub.mu.Unlock()

	for _, attached := range attachments {
		attached.closeChannels()
	}

	hub.stack.RemoveNIC(1)
	hub.stack.Close()
	hub.ep.RemoveNotify(hub.notifyHandle)
	hub.ep.Close()
	return nil
}

func (tunDev *deviceTun) Name() (string, error) { return tunDev.name, nil }
func (tunDev *deviceTun) File() *os.File        { return nil }
func (tunDev *deviceTun) Events() <-chan tun.Event {
	return tunDev.events
}

func (tunDev *deviceTun) Read(buf [][]byte, sizes []int, offset int) (int, error) {
	packet, ok := <-tunDev.incomingPacket
	if !ok {
		return 0, os.ErrClosed
	}
	n := copy(buf[0][offset:], packet.bytes)
	packet.Release()
	sizes[0] = n
	return 1, nil
}

func (tunDev *deviceTun) Write(buf [][]byte, offset int) (int, error) {
	for _, packetBuffer := range buf {
		packet := packetBuffer[offset:]
		if err := tunDev.WritePacket(packet); err != nil {
			return 0, err
		}
	}
	return len(buf), nil
}

func (tunDev *deviceTun) ReadPacket(ctx context.Context) ([]byte, error) {
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	case packet, ok := <-tunDev.incomingPacket:
		if !ok {
			return nil, os.ErrClosed
		}
		bytes := append([]byte(nil), packet.bytes...)
		packet.Release()
		return bytes, nil
	}
}

func (tunDev *deviceTun) WritePacket(packet []byte) error { return tunDev.parent.WritePacket(packet) }

func (tunDev *deviceTun) UpdateRoutes(routes []netip.Addr) {
	tunDev.parent.mu.Lock()
	defer tunDev.parent.mu.Unlock()

	for _, route := range tunDev.routes {
		if tunDev.parent.routes[route] == tunDev {
			delete(tunDev.parent.routes, route)
		}
	}
	tunDev.routes = append(tunDev.routes[:0], routes...)
	for _, route := range tunDev.routes {
		tunDev.parent.routes[route] = tunDev
	}
}

func (tunDev *deviceTun) Close() error {
	tunDev.parent.mu.Lock()
	delete(tunDev.parent.attachments, tunDev)
	for _, route := range tunDev.routes {
		delete(tunDev.parent.routes, route)
	}
	tunDev.parent.mu.Unlock()
	tunDev.closeChannels()
	return nil
}

func (tunDev *deviceTun) closeChannels() {
	if tunDev.events != nil {
		close(tunDev.events)
		tunDev.events = nil
	}
	if tunDev.incomingPacket != nil {
		incomingPacket := tunDev.incomingPacket
		close(incomingPacket)
		for packet := range incomingPacket {
			packet.Release()
		}
		tunDev.incomingPacket = nil
	}
}

func (tunDev *deviceTun) MTU() (int, error) { return tunDev.parent.mtu, nil }
func (tunDev *deviceTun) BatchSize() int    { return 1 }

func (ns *Network) ListenTCP(addr *net.TCPAddr) (*gonet.TCPListener, error) {
	if addr == nil {
		return ns.ListenTCPAddrPort(netip.AddrPort{})
	}
	ip, _ := netip.AddrFromSlice(addr.IP)
	return ns.ListenTCPAddrPort(netip.AddrPortFrom(ip, uint16(addr.Port)))
}

func (ns *Network) ListenTCPAddrPort(addr netip.AddrPort) (*gonet.TCPListener, error) {
	return gonet.ListenTCP(ns.stack, fullAddress(addr), ipv4.ProtocolNumber)
}

func (ns *Network) ListenUDPAddrPort(addr netip.AddrPort) (*gonet.UDPConn, error) {
	fullAddr := fullAddress(addr)
	return gonet.DialUDP(ns.stack, &fullAddr, nil, ipv4.ProtocolNumber)
}

func fullAddress(endpoint netip.AddrPort) tcpip.FullAddress {
	return tcpip.FullAddress{
		NIC:  1,
		Addr: tcpip.AddrFromSlice(endpoint.Addr().AsSlice()),
		Port: endpoint.Port(),
	}
}

func parsePacketInfo(packet []byte) (packetInfo, bool) {
	ip := header.IPv4(packet)
	if !ip.IsValid(len(packet)) {
		return packetInfo{}, false
	}

	var source [4]byte
	copy(source[:], ip.SourceAddressSlice())
	var dest [4]byte
	copy(dest[:], ip.DestinationAddressSlice())

	info := packetInfo{
		source: netip.AddrFrom4(source),
		dest:   netip.AddrFrom4(dest),
	}
	info.protocol, info.srcPort, info.destPort = parseTransport(ip.TransportProtocol(), ip.Payload())
	return info, true
}

func parseTransport(protocol tcpip.TransportProtocolNumber, payload []byte) (TrafficProtocol, *uint16, *uint16) {
	switch protocol {
	case header.TCPProtocolNumber:
		if len(payload) < header.TCPMinimumSize {
			return TrafficProtocolTCP, nil, nil
		}
		tcp := header.TCP(payload)
		sourcePort := tcp.SourcePort()
		destPort := tcp.DestinationPort()
		return TrafficProtocolTCP, &sourcePort, &destPort
	case header.UDPProtocolNumber:
		if len(payload) < header.UDPMinimumSize {
			return TrafficProtocolUDP, nil, nil
		}
		udp := header.UDP(payload)
		sourcePort := udp.SourcePort()
		destPort := udp.DestinationPort()
		return TrafficProtocolUDP, &sourcePort, &destPort
	case header.ICMPv4ProtocolNumber:
		return TrafficProtocolICMP, nil, nil
	default:
		return TrafficProtocolAny, nil, nil
	}
}

func rxChecksumOffloadEnabled() bool {
	switch strings.ToLower(strings.TrimSpace(os.Getenv(rxChecksumOffloadEnv))) {
	case "", "1", "true", "yes", "on":
		return true
	default:
		return false
	}
}
