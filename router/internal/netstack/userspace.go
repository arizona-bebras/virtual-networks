package netstack

import (
	"context"
	"fmt"
	"net"
	"net/netip"
	"os"
	"sync"
	"syscall"

	"golang.zx2c4.com/wireguard/tun"

	"gvisor.dev/gvisor/pkg/buffer"
	"gvisor.dev/gvisor/pkg/tcpip"
	"gvisor.dev/gvisor/pkg/tcpip/adapters/gonet"
	"gvisor.dev/gvisor/pkg/tcpip/header"
	"gvisor.dev/gvisor/pkg/tcpip/link/channel"
	"gvisor.dev/gvisor/pkg/tcpip/network/ipv4"
	"gvisor.dev/gvisor/pkg/tcpip/network/ipv6"
	"gvisor.dev/gvisor/pkg/tcpip/stack"
	"gvisor.dev/gvisor/pkg/tcpip/transport/icmp"
	"gvisor.dev/gvisor/pkg/tcpip/transport/tcp"
	"gvisor.dev/gvisor/pkg/tcpip/transport/udp"
)

type Hub struct {
	ep           *channel.Endpoint
	stack        *stack.Stack
	notifyHandle *channel.NotificationHandle
	mtu          int
	dnsServers   []netip.Addr
	hasV4        bool
	hasV6        bool

	mu          sync.RWMutex
	attachments map[*deviceTun]struct{}
	routes      map[netip.Addr]*deviceTun
	closed      bool
}

type deviceTun struct {
	parent         *Hub
	name           string
	routes         []netip.Addr
	events         chan tun.Event
	incomingPacket chan []byte
}

type Network struct {
	stack      *stack.Stack
	dnsServers []netip.Addr
	hasV4      bool
	hasV6      bool
}

func Create(localAddresses, dnsServers []netip.Addr, mtu int) (*Hub, *Network, error) {
	opts := stack.Options{
		NetworkProtocols:   []stack.NetworkProtocolFactory{ipv4.NewProtocol, ipv6.NewProtocol},
		TransportProtocols: []stack.TransportProtocolFactory{tcp.NewProtocol, udp.NewProtocol, icmp.NewProtocol6, icmp.NewProtocol4},
		HandleLocal:        true,
	}

	dev := &Hub{
		ep:          channel.New(1024, uint32(mtu), ""),
		stack:       stack.New(opts),
		dnsServers:  append([]netip.Addr(nil), dnsServers...),
		mtu:         mtu,
		attachments: make(map[*deviceTun]struct{}),
		routes:      make(map[netip.Addr]*deviceTun),
	}

	sackEnabledOpt := tcpip.TCPSACKEnabled(true)
	if err := dev.stack.SetTransportProtocolOption(tcp.ProtocolNumber, &sackEnabledOpt); err != nil {
		return nil, nil, fmt.Errorf("enable TCP SACK: %v", err)
	}

	dev.notifyHandle = dev.ep.AddNotify(dev)
	if err := dev.stack.CreateNIC(1, dev.ep); err != nil {
		return nil, nil, fmt.Errorf("create NIC: %v", err)
	}

	for _, ip := range localAddresses {
		var protoNumber tcpip.NetworkProtocolNumber
		switch {
		case ip.Is4():
			protoNumber = ipv4.ProtocolNumber
			dev.hasV4 = true
		case ip.Is6():
			protoNumber = ipv6.ProtocolNumber
			dev.hasV6 = true
		default:
			return nil, nil, fmt.Errorf("unsupported local address: %s", ip)
		}

		protoAddr := tcpip.ProtocolAddress{
			Protocol:          protoNumber,
			AddressWithPrefix: tcpip.AddrFromSlice(ip.AsSlice()).WithPrefix(),
		}
		if err := dev.stack.AddProtocolAddress(1, protoAddr, stack.AddressProperties{}); err != nil {
			return nil, nil, fmt.Errorf("add protocol address %s: %v", ip, err)
		}
	}

	if dev.hasV4 {
		if err := dev.stack.SetForwardingDefaultAndAllNICs(ipv4.ProtocolNumber, true); err != nil {
			return nil, nil, fmt.Errorf("enable IPv4 forwarding: %v", err)
		}
		dev.stack.AddRoute(tcpip.Route{Destination: header.IPv4EmptySubnet, NIC: 1})
	}
	if dev.hasV6 {
		if err := dev.stack.SetForwardingDefaultAndAllNICs(ipv6.ProtocolNumber, true); err != nil {
			return nil, nil, fmt.Errorf("enable IPv6 forwarding: %v", err)
		}
		dev.stack.AddRoute(tcpip.Route{Destination: header.IPv6EmptySubnet, NIC: 1})
	}

	return dev, &Network{
		stack:      dev.stack,
		dnsServers: append([]netip.Addr(nil), dnsServers...),
		hasV4:      dev.hasV4,
		hasV6:      dev.hasV6,
	}, nil
}

func (hub *Hub) Attach(name string, routes []netip.Addr) tun.Device {
	attached := &deviceTun{
		parent:         hub,
		name:           name,
		routes:         append([]netip.Addr(nil), routes...),
		events:         make(chan tun.Event, 10),
		incomingPacket: make(chan []byte, 128),
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

func (hub *Hub) WritePacket(packet []byte) error {
	if len(packet) == 0 {
		return nil
	}

	pkb := stack.NewPacketBuffer(stack.PacketBufferOptions{
		Payload: buffer.MakeWithData(packet),
	})
	switch packet[0] >> 4 {
	case 4:
		hub.ep.InjectInbound(header.IPv4ProtocolNumber, pkb)
	case 6:
		hub.ep.InjectInbound(header.IPv6ProtocolNumber, pkb)
	default:
		pkb.DecRef()
		return syscall.EAFNOSUPPORT
	}

	return nil
}

func (hub *Hub) WriteNotify() {
	for {
		pkt := hub.ep.Read()
		if pkt == nil {
			return
		}

		view := pkt.ToView()
		bytes := append([]byte(nil), view.AsSlice()...)
		view.Release()
		pkt.DecRef()

		dst, ok := packetDestination(bytes)
		if !ok {
			continue
		}

		hub.mu.RLock()
		attached := hub.routes[dst]
		hub.mu.RUnlock()
		if attached == nil {
			continue
		}

		select {
		case attached.incomingPacket <- bytes:
		default:
		}
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
	n := copy(buf[0][offset:], packet)
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
		return append([]byte(nil), packet...), nil
	}
}

func (tunDev *deviceTun) WritePacket(packet []byte) error { return tunDev.parent.WritePacket(packet) }

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
		close(tunDev.incomingPacket)
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
	fullAddr, proto := convertToFullAddr(addr)
	return gonet.ListenTCP(ns.stack, fullAddr, proto)
}

func (ns *Network) ListenUDPAddrPort(addr netip.AddrPort) (*gonet.UDPConn, error) {
	fullAddr, proto := convertToFullAddr(addr)
	return gonet.DialUDP(ns.stack, &fullAddr, nil, proto)
}

func convertToFullAddr(endpoint netip.AddrPort) (tcpip.FullAddress, tcpip.NetworkProtocolNumber) {
	var proto tcpip.NetworkProtocolNumber
	if endpoint.Addr().Is4() {
		proto = ipv4.ProtocolNumber
	} else {
		proto = ipv6.ProtocolNumber
	}

	return tcpip.FullAddress{
		NIC:  1,
		Addr: tcpip.AddrFromSlice(endpoint.Addr().AsSlice()),
		Port: endpoint.Port(),
	}, proto
}

func packetDestination(packet []byte) (netip.Addr, bool) {
	if len(packet) == 0 {
		return netip.Addr{}, false
	}
	switch packet[0] >> 4 {
	case 4:
		if len(packet) < 20 {
			return netip.Addr{}, false
		}
		var dst [4]byte
		copy(dst[:], packet[16:20])
		return netip.AddrFrom4(dst), true
	case 6:
		if len(packet) < 40 {
			return netip.Addr{}, false
		}
		var dst [16]byte
		copy(dst[:], packet[24:40])
		return netip.AddrFrom16(dst), true
	default:
		return netip.Addr{}, false
	}
}
