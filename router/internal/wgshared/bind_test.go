package wgshared

import (
	"net/netip"
	"testing"

	"golang.zx2c4.com/wireguard/device"
)

func TestFilterOutboundPacketsSuppressesHandshakeInitiations(t *testing.T) {
	initiation := makePacket(device.MessageInitiationType, device.MessageInitiationSize)
	response := makePacket(device.MessageResponseType, device.MessageResponseSize)

	filtered := filterOutboundPackets("wg-test", [][]byte{initiation, response}, testEndpoint{})

	if len(filtered) != 1 {
		t.Fatalf("filtered packet count = %d, want 1", len(filtered))
	}
	if filtered[0][0] != byte(device.MessageResponseType) {
		t.Fatalf("remaining packet type = %d, want handshake response", filtered[0][0])
	}
}

func TestFilterOutboundPacketsAllowsNonInitiations(t *testing.T) {
	response := makePacket(device.MessageResponseType, device.MessageResponseSize)
	transport := makePacket(device.MessageTransportType, device.MessageTransportSize)

	filtered := filterOutboundPackets("wg-test", [][]byte{response, transport}, testEndpoint{})

	if len(filtered) != 2 {
		t.Fatalf("filtered packet count = %d, want 2", len(filtered))
	}
}

func makePacket(packetType uint32, size int) []byte {
	packet := make([]byte, size)
	packet[0] = byte(packetType)
	return packet
}

type testEndpoint struct{}

func (testEndpoint) ClearSrc()           {}
func (testEndpoint) SrcToString() string { return "" }
func (testEndpoint) DstToString() string { return "127.0.0.1:49999" }
func (testEndpoint) DstToBytes() []byte  { return []byte{127, 0, 0, 1, 195, 79} }
func (testEndpoint) DstIP() netip.Addr   { return netip.MustParseAddr("127.0.0.1") }
func (testEndpoint) SrcIP() netip.Addr   { return netip.Addr{} }
