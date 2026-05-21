package router

import (
	"encoding/binary"
	"io"
	"net"
	"net/netip"
	"testing"

	"golang.org/x/net/dns/dnsmessage"
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

	response, err := resolver.resolve(dnsQuery("device-1.internal", dnsmessage.TypeA), "udp")
	if err != nil {
		t.Fatal(err)
	}

	assertDNSRCode(t, response, 0)
	message := unpackDNSResponse(t, response)
	if got := len(message.Answers); got != 1 {
		t.Fatalf("answer count = %d, want 1", got)
	}
	answer, ok := message.Answers[0].Body.(*dnsmessage.AResource)
	if !ok {
		t.Fatalf("answer type = %T, want A", message.Answers[0].Body)
	}
	if got := netip.AddrFrom4(answer.A); got != netip.MustParseAddr("10.44.0.2") {
		t.Fatalf("A record = %s, want 10.44.0.2", got)
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

	response, err := resolver.resolve(dnsQuery("router.internal", dnsmessage.TypeA), "udp")
	if err != nil {
		t.Fatal(err)
	}

	assertDNSRCode(t, response, 0)
	message := unpackDNSResponse(t, response)
	answer, ok := message.Answers[0].Body.(*dnsmessage.AResource)
	if !ok {
		t.Fatalf("answer type = %T, want A", message.Answers[0].Body)
	}
	if got := netip.AddrFrom4(answer.A); got != netip.MustParseAddr("10.44.0.1") {
		t.Fatalf("A record = %s, want 10.44.0.1", got)
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

	response, err := resolver.resolve(dnsQuery("2.0.44.10.in-addr.arpa", dnsmessage.TypePTR), "udp")
	if err != nil {
		t.Fatal(err)
	}

	assertDNSRCode(t, response, 0)
	message := unpackDNSResponse(t, response)
	if got := len(message.Answers); got != 1 {
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

	response, err := resolver.resolve(dnsQuery("missing.internal", dnsmessage.TypeA), "udp")
	if err != nil {
		t.Fatal(err)
	}

	assertDNSRCode(t, response, dnsmessage.RCodeNameError)
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

	response, err := resolver.resolve(dnsQuery("99.0.44.10.in-addr.arpa", dnsmessage.TypePTR), "udp")
	if err != nil {
		t.Fatal(err)
	}

	assertDNSRCode(t, response, dnsmessage.RCodeNameError)
}

func TestForwardDNSQueryUsesTCPFraming(t *testing.T) {
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		_ = listener.Close()
	})

	errCh := make(chan error, 1)
	go func() {
		conn, err := listener.Accept()
		if err != nil {
			errCh <- err
			return
		}
		defer conn.Close()

		var lengthBuf [2]byte
		if _, err := io.ReadFull(conn, lengthBuf[:]); err != nil {
			errCh <- err
			return
		}
		length := int(binary.BigEndian.Uint16(lengthBuf[:]))
		query := make([]byte, length)
		if _, err := io.ReadFull(conn, query); err != nil {
			errCh <- err
			return
		}

		var message dnsmessage.Message
		if err := message.Unpack(query); err != nil {
			errCh <- err
			return
		}
		response, err := packDNSResponse(message, nil, dnsmessage.RCodeSuccess)
		if err != nil {
			errCh <- err
			return
		}

		binary.BigEndian.PutUint16(lengthBuf[:], uint16(len(response)))
		if _, err := conn.Write(append(lengthBuf[:], response...)); err != nil {
			errCh <- err
			return
		}
		errCh <- nil
	}()

	response, err := forwardDNSQuery(dnsQuery("example.com", dnsmessage.TypeA), listener.Addr().String(), "tcp")
	if err != nil {
		t.Fatal(err)
	}
	if err := <-errCh; err != nil {
		t.Fatal(err)
	}
	assertDNSRCode(t, response, dnsmessage.RCodeSuccess)
}

func dnsQuery(name string, typ dnsmessage.Type) []byte {
	msg := dnsmessage.Message{
		Header: dnsmessage.Header{
			ID:               0x1234,
			RecursionDesired: true,
		},
		Questions: []dnsmessage.Question{{
			Name:  dnsmessage.MustNewName(normalizeDNSName(name)),
			Type:  typ,
			Class: dnsmessage.ClassINET,
		}},
	}
	query, err := msg.Pack()
	if err != nil {
		panic(err)
	}
	return query
}

func assertDNSRCode(t *testing.T, response []byte, want dnsmessage.RCode) {
	t.Helper()
	message := unpackDNSResponse(t, response)
	if got := message.Header.RCode; got != want {
		t.Fatalf("rcode = %d, want %d", got, want)
	}
}

func unpackDNSResponse(t *testing.T, response []byte) dnsmessage.Message {
	t.Helper()
	var message dnsmessage.Message
	if err := message.Unpack(response); err != nil {
		t.Fatal(err)
	}
	return message
}
