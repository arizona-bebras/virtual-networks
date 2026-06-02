package netstack

import (
	"net/netip"
	"testing"

	"gvisor.dev/gvisor/pkg/tcpip/header"
)

func TestTrafficPolicyAllowsAllPeerSelectors(t *testing.T) {
	source := netip.MustParseAddr("10.0.0.2")
	dest := netip.MustParseAddr("10.0.0.3")
	hub := testPolicyHub(source, dest)
	hub.SetTrafficRules([]TrafficRule{{
		Source:      TrafficPeerSelector{All: true},
		Destination: TrafficPeerSelector{All: true},
	}})

	if !hub.allowPacket(testIPv4Packet(source, dest, byte(header.TCPProtocolNumber), 12345, 443)) {
		t.Fatal("expected all-to-all rule to allow peer packet")
	}
}

func TestTrafficPolicyDeniesPeerPacketWithoutMatchingRule(t *testing.T) {
	source := netip.MustParseAddr("10.0.0.2")
	dest := netip.MustParseAddr("10.0.0.3")
	hub := testPolicyHub(source, dest)

	if hub.allowPacket(testIPv4Packet(source, dest, byte(header.TCPProtocolNumber), 12345, 443)) {
		t.Fatal("expected peer packet without a matching rule to be denied")
	}
}

func TestTrafficPolicyDistinguishesEmptyScopedSelectorFromAll(t *testing.T) {
	source := netip.MustParseAddr("10.0.0.2")
	dest := netip.MustParseAddr("10.0.0.3")
	hub := testPolicyHub(source, dest)
	hub.SetTrafficRules([]TrafficRule{{
		Source:      TrafficPeerSelector{},
		Destination: TrafficPeerSelector{All: true},
	}})

	if hub.allowPacket(testIPv4Packet(source, dest, byte(header.TCPProtocolNumber), 12345, 443)) {
		t.Fatal("expected empty scoped source selector to deny peer packet")
	}
}

func TestTrafficPolicyMatchesProtocolAndDestinationPort(t *testing.T) {
	source := netip.MustParseAddr("10.0.0.2")
	dest := netip.MustParseAddr("10.0.0.3")
	port := uint16(443)
	hub := testPolicyHub(source, dest)
	hub.SetTrafficRules([]TrafficRule{{
		Source:      TrafficPeerSelector{Addrs: []netip.Addr{source}},
		Destination: TrafficPeerSelector{Addrs: []netip.Addr{dest}},
		Protocol:    TrafficProtocolTCP,
		Port:        &port,
	}})

	if !hub.allowPacket(testIPv4Packet(source, dest, byte(header.TCPProtocolNumber), 12345, 443)) {
		t.Fatal("expected matching TCP destination port to allow peer packet")
	}
	if hub.allowPacket(testIPv4Packet(source, dest, byte(header.UDPProtocolNumber), 12345, 443)) {
		t.Fatal("expected UDP packet to miss TCP rule")
	}
	if hub.allowPacket(testIPv4Packet(source, dest, byte(header.TCPProtocolNumber), 12345, 8443)) {
		t.Fatal("expected different TCP destination port to miss rule")
	}
	if !hub.allowPacket(testIPv4Packet(dest, source, byte(header.TCPProtocolNumber), 443, 12345)) {
		t.Fatal("expected TCP response from matching source port to match reverse rule")
	}
	if hub.allowPacket(testIPv4Packet(dest, source, byte(header.TCPProtocolNumber), 8443, 12345)) {
		t.Fatal("expected TCP response from different source port to miss reverse rule")
	}
}

func TestTrafficPolicyMatchesUDPDestinationPort(t *testing.T) {
	source := netip.MustParseAddr("10.0.0.2")
	dest := netip.MustParseAddr("10.0.0.3")
	port := uint16(51820)
	hub := testPolicyHub(source, dest)
	hub.SetTrafficRules([]TrafficRule{{
		Source:      TrafficPeerSelector{Addrs: []netip.Addr{source}},
		Destination: TrafficPeerSelector{Addrs: []netip.Addr{dest}},
		Protocol:    TrafficProtocolUDP,
		Port:        &port,
	}})

	if !hub.allowPacket(testIPv4Packet(source, dest, byte(header.UDPProtocolNumber), 12345, 51820)) {
		t.Fatal("expected matching UDP destination port to allow peer packet")
	}
	if !hub.allowPacket(testIPv4Packet(source, dest, byte(header.UDPProtocolNumber), 51820, 12345)) {
		t.Fatal("expected matching UDP source port to allow peer packet")
	}
	if hub.allowPacket(testIPv4Packet(source, dest, byte(header.UDPProtocolNumber), 12345, 53)) {
		t.Fatal("expected different UDP destination port to miss rule")
	}
	if hub.allowPacket(testIPv4Packet(source, dest, byte(header.TCPProtocolNumber), 12345, 51820)) {
		t.Fatal("expected TCP packet to miss UDP rule")
	}
	if !hub.allowPacket(testIPv4Packet(dest, source, byte(header.UDPProtocolNumber), 51820, 12345)) {
		t.Fatal("expected UDP response from matching source port to match reverse rule")
	}
	if !hub.allowPacket(testIPv4Packet(dest, source, byte(header.UDPProtocolNumber), 12345, 51820)) {
		t.Fatal("expected UDP response with matching destination port to match reverse rule")
	}
	if hub.allowPacket(testIPv4Packet(dest, source, byte(header.UDPProtocolNumber), 53, 12345)) {
		t.Fatal("expected UDP response from different source port to miss reverse rule")
	}
}

func TestTrafficPolicyAllowsRouterLocalDestination(t *testing.T) {
	source := netip.MustParseAddr("10.0.0.2")
	peerDest := netip.MustParseAddr("10.0.0.3")
	routerDest := netip.MustParseAddr("10.0.0.1")
	hub := testPolicyHub(source, peerDest)

	if !hub.allowPacket(testIPv4Packet(source, routerDest, byte(header.UDPProtocolNumber), 12345, 53)) {
		t.Fatal("expected router-local destination to bypass peer traffic policy")
	}
}

func testPolicyHub(peerAddrs ...netip.Addr) *Hub {
	hub := &Hub{
		routes: make(map[netip.Addr]*deviceTun),
	}
	for _, addr := range peerAddrs {
		hub.routes[addr] = nil
	}
	return hub
}

func testIPv4Packet(source netip.Addr, dest netip.Addr, protocol byte, sourcePort, destPort uint16) []byte {
	transportHeaderLen := 0
	switch protocol {
	case byte(header.TCPProtocolNumber):
		transportHeaderLen = header.TCPMinimumSize
	case byte(header.UDPProtocolNumber):
		transportHeaderLen = header.UDPMinimumSize
	case byte(header.ICMPv4ProtocolNumber):
		transportHeaderLen = 8
	default:
		transportHeaderLen = 4
	}

	packet := make([]byte, header.IPv4MinimumSize+transportHeaderLen)
	packet[0] = 0x45
	totalLength := uint16(len(packet))
	packet[2] = byte(totalLength >> 8)
	packet[3] = byte(totalLength)
	packet[9] = protocol
	source4 := source.As4()
	dest4 := dest.As4()
	copy(packet[12:16], source4[:])
	copy(packet[16:20], dest4[:])
	packet[header.IPv4MinimumSize] = byte(sourcePort >> 8)
	packet[header.IPv4MinimumSize+1] = byte(sourcePort)
	packet[header.IPv4MinimumSize+2] = byte(destPort >> 8)
	packet[header.IPv4MinimumSize+3] = byte(destPort)
	if protocol == byte(header.TCPProtocolNumber) {
		packet[header.IPv4MinimumSize+12] = byte(header.TCPMinimumSize / 4 << 4)
	}
	if protocol == byte(header.UDPProtocolNumber) {
		udpLength := uint16(header.UDPMinimumSize)
		packet[header.IPv4MinimumSize+4] = byte(udpLength >> 8)
		packet[header.IPv4MinimumSize+5] = byte(udpLength)
	}
	return packet
}
