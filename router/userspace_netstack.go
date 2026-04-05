package main

import (
	"context"
	"fmt"
	"net"
	"net/netip"
	"os"
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

type userspaceTun struct {
	ep             *channel.Endpoint
	stack          *stack.Stack
	events         chan tun.Event
	notifyHandle   *channel.NotificationHandle
	incomingPacket chan *buffer.View
	mtu            int
	dnsServers     []netip.Addr
	hasV4          bool
	hasV6          bool
}

type userspaceNetstack struct {
	stack      *stack.Stack
	dnsServers []netip.Addr
	hasV4      bool
	hasV6      bool
}

func createUserspaceNetstack(localAddresses, dnsServers []netip.Addr, mtu int) (tun.Device, *userspaceNetstack, error) {
	opts := stack.Options{
		NetworkProtocols:   []stack.NetworkProtocolFactory{ipv4.NewProtocol, ipv6.NewProtocol},
		TransportProtocols: []stack.TransportProtocolFactory{tcp.NewProtocol, udp.NewProtocol, icmp.NewProtocol6, icmp.NewProtocol4},
		HandleLocal:        true,
	}

	dev := &userspaceTun{
		ep:             channel.New(1024, uint32(mtu), ""),
		stack:          stack.New(opts),
		events:         make(chan tun.Event, 10),
		incomingPacket: make(chan *buffer.View),
		dnsServers:     append([]netip.Addr(nil), dnsServers...),
		mtu:            mtu,
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
		dev.stack.AddRoute(tcpip.Route{Destination: header.IPv4EmptySubnet, NIC: 1})
	}
	if dev.hasV6 {
		dev.stack.AddRoute(tcpip.Route{Destination: header.IPv6EmptySubnet, NIC: 1})
	}

	dev.events <- tun.EventUp

	return dev, &userspaceNetstack{
		stack:      dev.stack,
		dnsServers: append([]netip.Addr(nil), dnsServers...),
		hasV4:      dev.hasV4,
		hasV6:      dev.hasV6,
	}, nil
}

func (tunDev *userspaceTun) Name() (string, error) {
	return "go", nil
}

func (tunDev *userspaceTun) File() *os.File {
	return nil
}

func (tunDev *userspaceTun) Events() <-chan tun.Event {
	return tunDev.events
}

func (tunDev *userspaceTun) Read(buf [][]byte, sizes []int, offset int) (int, error) {
	view, ok := <-tunDev.incomingPacket
	if !ok {
		return 0, os.ErrClosed
	}

	n, err := view.Read(buf[0][offset:])
	if err != nil {
		return 0, err
	}
	sizes[0] = n
	return 1, nil
}

func (tunDev *userspaceTun) Write(buf [][]byte, offset int) (int, error) {
	for _, packetBuffer := range buf {
		packet := packetBuffer[offset:]
		if len(packet) == 0 {
			continue
		}

		pkb := stack.NewPacketBuffer(stack.PacketBufferOptions{
			Payload: buffer.MakeWithData(packet),
		})
		switch packet[0] >> 4 {
		case 4:
			tunDev.ep.InjectInbound(header.IPv4ProtocolNumber, pkb)
		case 6:
			tunDev.ep.InjectInbound(header.IPv6ProtocolNumber, pkb)
		default:
			pkb.DecRef()
			return 0, syscall.EAFNOSUPPORT
		}
	}

	return len(buf), nil
}

func (tunDev *userspaceTun) WriteNotify() {
	pkt := tunDev.ep.Read()
	if pkt == nil {
		return
	}

	view := pkt.ToView()
	pkt.DecRef()
	tunDev.incomingPacket <- view
}

func (tunDev *userspaceTun) Close() error {
	tunDev.stack.RemoveNIC(1)
	tunDev.stack.Close()
	tunDev.ep.RemoveNotify(tunDev.notifyHandle)
	tunDev.ep.Close()

	if tunDev.events != nil {
		close(tunDev.events)
	}
	if tunDev.incomingPacket != nil {
		close(tunDev.incomingPacket)
	}

	return nil
}

func (tunDev *userspaceTun) MTU() (int, error) {
	return tunDev.mtu, nil
}

func (tunDev *userspaceTun) BatchSize() int {
	return 1
}

func (ns *userspaceNetstack) Stack() *stack.Stack {
	return ns.stack
}

func (ns *userspaceNetstack) ListenTCP(addr *net.TCPAddr) (*gonet.TCPListener, error) {
	if addr == nil {
		return ns.ListenTCPAddrPort(netip.AddrPort{})
	}
	ip, _ := netip.AddrFromSlice(addr.IP)
	return ns.ListenTCPAddrPort(netip.AddrPortFrom(ip, uint16(addr.Port)))
}

func (ns *userspaceNetstack) ListenTCPAddrPort(addr netip.AddrPort) (*gonet.TCPListener, error) {
	fullAddr, proto := convertToFullAddr(addr)
	return gonet.ListenTCP(ns.stack, fullAddr, proto)
}

func (ns *userspaceNetstack) DialContextTCPAddrPort(ctx context.Context, addr netip.AddrPort) (*gonet.TCPConn, error) {
	fullAddr, proto := convertToFullAddr(addr)
	return gonet.DialContextTCP(ctx, ns.stack, fullAddr, proto)
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
