package router

import (
	"encoding/binary"
	"net/netip"
	"testing"
)

func TestDNSResolverAnswersInternalDevice(t *testing.T) {
	resolver := newDNSResolver(
		OverlayConfig{
			NetworkID:  "primary",
			ServerAddr: netip.MustParseAddr("10.44.0.1"),
		},
		[]ProtocolConfig{{
			NetworkID: "primary",
			WireGuard: &WireGuardProtocolConfig{
				Peers: []WireGuardPeerConfig{{
					ID:   "device-1",
					Addr: netip.MustParseAddr("10.44.0.2"),
				}},
			},
		}},
		"127.0.0.1:1",
	)

	response, err := resolver.resolve(dnsQuery("device-1.internal", dnsTypeA))
	if err != nil {
		t.Fatal(err)
	}

	assertDNSRCode(t, response, 0)
	if got := binary.BigEndian.Uint16(response[6:8]); got != 1 {
		t.Fatalf("answer count = %d, want 1", got)
	}
	if got := response[len(response)-4:]; string(got) != string([]byte{10, 44, 0, 2}) {
		t.Fatalf("A record bytes = %v, want 10.44.0.2", got)
	}
}

func TestDNSResolverAnswersRouter(t *testing.T) {
	resolver := newDNSResolver(
		OverlayConfig{
			NetworkID:  "primary",
			ServerAddr: netip.MustParseAddr("10.44.0.1"),
		},
		nil,
		"127.0.0.1:1",
	)

	response, err := resolver.resolve(dnsQuery("router.internal", dnsTypeA))
	if err != nil {
		t.Fatal(err)
	}

	assertDNSRCode(t, response, 0)
	if got := response[len(response)-4:]; string(got) != string([]byte{10, 44, 0, 1}) {
		t.Fatalf("A record bytes = %v, want 10.44.0.1", got)
	}
}

func TestDNSResolverAnswersPTR(t *testing.T) {
	resolver := newDNSResolver(
		OverlayConfig{
			NetworkID:  "primary",
			ServerAddr: netip.MustParseAddr("10.44.0.1"),
		},
		[]ProtocolConfig{{
			NetworkID: "primary",
			WireGuard: &WireGuardProtocolConfig{
				Peers: []WireGuardPeerConfig{{
					ID:   "device-1",
					Addr: netip.MustParseAddr("10.44.0.2"),
				}},
			},
		}},
		"127.0.0.1:1",
	)

	response, err := resolver.resolve(dnsQuery("2.0.44.10.in-addr.arpa", dnsTypePTR))
	if err != nil {
		t.Fatal(err)
	}

	assertDNSRCode(t, response, 0)
	if got := binary.BigEndian.Uint16(response[6:8]); got != 1 {
		t.Fatalf("answer count = %d, want 1", got)
	}
}

func TestDNSResolverReturnsNXDOMAINForUnknownInternal(t *testing.T) {
	resolver := newDNSResolver(
		OverlayConfig{
			NetworkID:  "primary",
			ServerAddr: netip.MustParseAddr("10.44.0.1"),
		},
		nil,
		"127.0.0.1:1",
	)

	response, err := resolver.resolve(dnsQuery("missing.internal", dnsTypeA))
	if err != nil {
		t.Fatal(err)
	}

	assertDNSRCode(t, response, dnsRCodeNameError)
}

func TestDNSResolverReturnsNXDOMAINForUnknownOverlayPTR(t *testing.T) {
	resolver := newDNSResolver(
		OverlayConfig{
			NetworkID:   "primary",
			ServerAddr:  netip.MustParseAddr("10.44.0.1"),
			OverlayCIDR: netip.MustParsePrefix("10.44.0.0/24"),
		},
		nil,
		"127.0.0.1:1",
	)

	response, err := resolver.resolve(dnsQuery("99.0.44.10.in-addr.arpa", dnsTypePTR))
	if err != nil {
		t.Fatal(err)
	}

	assertDNSRCode(t, response, dnsRCodeNameError)
}

func dnsQuery(name string, typ uint16) []byte {
	query := make([]byte, 12)
	binary.BigEndian.PutUint16(query[0:2], 0x1234)
	binary.BigEndian.PutUint16(query[2:4], 0x0100)
	binary.BigEndian.PutUint16(query[4:6], 1)
	query = append(query, encodeDNSName(name)...)
	query = binary.BigEndian.AppendUint16(query, typ)
	query = binary.BigEndian.AppendUint16(query, dnsClassIN)
	return query
}

func assertDNSRCode(t *testing.T, response []byte, want int) {
	t.Helper()
	if len(response) < 12 {
		t.Fatalf("response too short: %d", len(response))
	}
	if got := int(response[3] & 0x0f); got != want {
		t.Fatalf("rcode = %d, want %d", got, want)
	}
}
