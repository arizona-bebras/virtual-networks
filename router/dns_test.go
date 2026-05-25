package router

import (
	"encoding/binary"
	"fmt"
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

func TestDNSResolverForwardsMixedPrivateAndPublicQuestions(t *testing.T) {
	forwarder, err := net.ListenPacket("udp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		_ = forwarder.Close()
	})

	errCh := make(chan error, 1)
	go func() {
		buf := make([]byte, dnsMaxUDPPacket)
		n, addr, err := forwarder.ReadFrom(buf)
		if err != nil {
			errCh <- err
			return
		}
		var query dnsmessage.Message
		if err := query.Unpack(buf[:n]); err != nil {
			errCh <- err
			return
		}
		if got := len(query.Questions); got != 2 {
			errCh <- fmt.Errorf("question count = %d, want 2", got)
			return
		}
		response, err := packDNSResponse(query, nil, dnsmessage.RCodeSuccess)
		if err != nil {
			errCh <- err
			return
		}
		_, err = forwarder.WriteTo(response, addr)
		errCh <- err
	}()

	resolver := newDNSResolver(
		OverlayConfig{
			NetworkID:  "primary",
			ServerAddr: netip.MustParseAddr("10.44.0.1"),
		},
		nil,
		forwarder.LocalAddr().String(),
	)

	response, err := resolver.resolve(dnsQueryQuestions(
		dnsQuestion("router.internal", dnsmessage.TypeA),
		dnsQuestion("example.com", dnsmessage.TypeA),
	), "udp")
	if err != nil {
		t.Fatal(err)
	}
	if err := <-errCh; err != nil {
		t.Fatal(err)
	}

	message := unpackDNSResponse(t, response)
	if message.Header.Authoritative {
		t.Fatal("mixed private/public response was answered locally")
	}
	assertDNSRCode(t, response, dnsmessage.RCodeSuccess)
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
	return dnsQueryQuestions(dnsQuestion(name, typ))
}

func dnsQuestion(name string, typ dnsmessage.Type) dnsmessage.Question {
	return dnsmessage.Question{
		Name:  dnsmessage.MustNewName(normalizeDNSName(name)),
		Type:  typ,
		Class: dnsmessage.ClassINET,
	}
}

func dnsQueryQuestions(questions ...dnsmessage.Question) []byte {
	msg := dnsmessage.Message{
		Header: dnsmessage.Header{
			ID:               0x1234,
			RecursionDesired: true,
		},
		Questions: questions,
	}
	query, err := msg.Pack()
	if err != nil {
		panic(err)
	}
	return query
}

func TestForwardedUDPResponseRetriesTruncatedResponseOverTCP(t *testing.T) {
	query := dnsQuery("example.com", dnsmessage.TypeA)
	udpResponse := mustPackDNS(t, dnsmessage.Message{
		Header: dnsmessage.Header{
			ID:                 0x1234,
			Response:           true,
			Truncated:          true,
			RecursionDesired:   true,
			RecursionAvailable: true,
		},
	})

	tcpResponse := mustPackDNS(t, dnsmessage.Message{
		Header: dnsmessage.Header{
			ID:                 0x1234,
			Response:           true,
			RecursionDesired:   true,
			RecursionAvailable: true,
		},
		Questions: []dnsmessage.Question{{
			Name:  dnsmessage.MustNewName("example.com."),
			Type:  dnsmessage.TypeA,
			Class: dnsmessage.ClassINET,
		}},
		Answers: []dnsmessage.Resource{{
			Header: dnsmessage.ResourceHeader{
				Name:  dnsmessage.MustNewName("example.com."),
				Type:  dnsmessage.TypeA,
				Class: dnsmessage.ClassINET,
				TTL:   dnsDefaultTTL,
			},
			Body: &dnsmessage.AResource{A: [4]byte{93, 184, 216, 34}},
		}},
	})

	response, err := finishForwardedUDPResponse(query, udpResponse, false, func() ([]byte, error) {
		return tcpResponse, nil
	})
	if err != nil {
		t.Fatal(err)
	}
	message := unpackDNSResponse(t, response)
	if message.Header.Truncated {
		t.Fatal("response is still marked truncated after TCP retry")
	}
	if got := len(message.Answers); got != 1 {
		t.Fatalf("answer count = %d, want 1", got)
	}
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

func mustPackDNS(t *testing.T, message dnsmessage.Message) []byte {
	t.Helper()
	packet, err := message.Pack()
	if err != nil {
		t.Fatal(err)
	}
	return packet
}
