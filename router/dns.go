package router

import (
	"context"
	"encoding/binary"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/netip"
	"os"
	"strings"
	"time"

	"router/internal/netstack"

	"golang.org/x/net/dns/dnsmessage"
)

const (
	dnsPort               = 53
	dnsDefaultTTL         = 60
	dnsForwardTimeout     = 5 * time.Second
	dnsMaxUDPPacket       = 1232
	dnsMaxTCPPacket       = 65535
	defaultDNSForwardAddr = "1.1.1.1:53"
)

type dnsResolver struct {
	cfg        OverlayConfig
	forwarder  string
	records    map[string]netip.Addr
	ptrRecords map[string]string
}

func startDNSResolver(
	tnet *netstack.Network,
	overlay OverlayConfig,
	protocols []ProtocolConfig,
) (func() error, error) {
	resolver := newDNSResolver(overlay, protocols, dnsForwarderAddr())

	udpConn, err := tnet.ListenUDPAddrPort(netip.AddrPortFrom(overlay.ServerAddr, dnsPort))
	if err != nil {
		return nil, fmt.Errorf("listen udp: %w", err)
	}
	tcpListener, err := tnet.ListenTCPAddrPort(netip.AddrPortFrom(overlay.ServerAddr, dnsPort))
	if err != nil {
		_ = udpConn.Close()
		return nil, fmt.Errorf("listen tcp: %w", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	go resolver.serveUDP(ctx, udpConn)
	go resolver.serveTCP(ctx, tcpListener)

	return func() error {
		cancel()
		errUDP := udpConn.Close()
		errTCP := tcpListener.Close()
		if errUDP != nil {
			return errUDP
		}
		return errTCP
	}, nil
}

func newDNSResolver(overlay OverlayConfig, protocols []ProtocolConfig, forwarder string) *dnsResolver {
	records := map[string]netip.Addr{
		"router.internal.":               overlay.ServerAddr,
		normalizeDNSName(overlay.Domain): overlay.ServerAddr,
	}

	for _, protocol := range protocols {
		if protocol.NetworkID != overlay.NetworkID || protocol.WireGuard == nil {
			continue
		}
		for _, peer := range protocol.WireGuard.Peers {
			name := normalizeDNSName(peer.Domain + "." + overlay.Domain)
			if existing, ok := records[name]; ok && existing != peer.Addr {
				log.Printf("dns record %s has conflicting addresses %s and %s; keeping %s", name, existing, peer.Addr, existing)
				continue
			}
			records[name] = peer.Addr
		}
	}

	ptrRecords := make(map[string]string, len(records))
	for name, addr := range records {
		if ptr, ok := reverseName(addr); ok {
			ptrRecords[ptr] = name
		}
	}

	return &dnsResolver{
		cfg:        overlay,
		forwarder:  forwarder,
		records:    records,
		ptrRecords: ptrRecords,
	}
}

func (r *dnsResolver) serveUDP(ctx context.Context, conn net.PacketConn) {
	buf := make([]byte, dnsMaxUDPPacket)
	for {
		n, addr, err := conn.ReadFrom(buf)
		if err != nil {
			if ctx.Err() == nil {
				log.Printf("dns udp read for network %q: %v", r.cfg.NetworkID, err)
			}
			return
		}

		query := append([]byte(nil), buf[:n]...)
		go func() {
			response, err := r.resolve(query, "udp")
			if err != nil {
				log.Printf("dns udp query for network %q: %v", r.cfg.NetworkID, err)
				return
			}
			if _, err := conn.WriteTo(response, addr); err != nil && ctx.Err() == nil {
				log.Printf("dns udp write for network %q: %v", r.cfg.NetworkID, err)
			}
		}()
	}
}

func (r *dnsResolver) serveTCP(ctx context.Context, listener net.Listener) {
	for {
		conn, err := listener.Accept()
		if err != nil {
			if ctx.Err() == nil {
				log.Printf("dns tcp accept for network %q: %v", r.cfg.NetworkID, err)
			}
			return
		}
		go r.handleTCPConn(ctx, conn)
	}
}

func (r *dnsResolver) handleTCPConn(ctx context.Context, conn net.Conn) {
	defer conn.Close()
	for {
		var lengthBuf [2]byte
		if _, err := io.ReadFull(conn, lengthBuf[:]); err != nil {
			if !errors.Is(err, io.EOF) && ctx.Err() == nil {
				log.Printf("dns tcp length read for network %q: %v", r.cfg.NetworkID, err)
			}
			return
		}
		length := int(binary.BigEndian.Uint16(lengthBuf[:]))
		if length == 0 || length > dnsMaxTCPPacket {
			return
		}

		query := make([]byte, length)
		if _, err := io.ReadFull(conn, query); err != nil {
			if ctx.Err() == nil {
				log.Printf("dns tcp query read for network %q: %v", r.cfg.NetworkID, err)
			}
			return
		}

		response, err := r.resolve(query, "tcp")
		if err != nil {
			log.Printf("dns tcp query for network %q: %v", r.cfg.NetworkID, err)
			return
		}
		if len(response) > dnsMaxTCPPacket {
			return
		}
		binary.BigEndian.PutUint16(lengthBuf[:], uint16(len(response)))
		if _, err := conn.Write(append(lengthBuf[:], response...)); err != nil && ctx.Err() == nil {
			log.Printf("dns tcp write for network %q: %v", r.cfg.NetworkID, err)
			return
		}
	}
}

func (r *dnsResolver) resolve(query []byte, network string) ([]byte, error) {
	var message dnsmessage.Message
	if err := message.Unpack(query); err != nil {
		return errorDNSResponse(query, dnsmessage.RCodeFormatError)
	}
	if len(message.Questions) == 0 {
		return packDNSResponse(message, nil, dnsmessage.RCodeSuccess)
	}

	private, answers, nameExists := r.privateAnswers(message.Questions)
	if private {
		rcode := dnsmessage.RCodeSuccess
		if !nameExists {
			rcode = dnsmessage.RCodeNameError
		}
		return packDNSResponse(message, answers, rcode)
	}

	return forwardDNSQuery(query, r.forwarder, network)
}

func (r *dnsResolver) privateAnswers(questions []dnsmessage.Question) (bool, []dnsmessage.Resource, bool) {
	nameExists := true
	var answers []dnsmessage.Resource

	for _, question := range questions {
		private, exists, questionAnswers := r.privateQuestionAnswers(question)
		if !private {
			return false, nil, true
		}
		if !exists {
			nameExists = false
			continue
		}
		answers = append(answers, questionAnswers...)
	}

	return true, answers, nameExists
}

func (r *dnsResolver) privateQuestionAnswers(question dnsmessage.Question) (bool, bool, []dnsmessage.Resource) {
	if question.Class != dnsmessage.ClassINET {
		return false, true, nil
	}
	name := normalizeDNSName(question.Name.String())

	if strings.HasSuffix(name, ".internal.") {
		addr, ok := r.records[name]
		if !ok {
			return true, false, nil
		}
		return true, true, addressAnswers(question, addr)
	}

	if !isReverseDNSName(name) {
		return false, true, nil
	}
	if ptr, ok := r.ptrRecords[name]; ok {
		if question.Type != dnsmessage.TypePTR && question.Type != dnsmessage.TypeALL {
			return true, true, nil
		}
		return true, true, []dnsmessage.Resource{ptrAnswer(question, ptr)}
	}
	if addr, ok := reverseAddr(name); ok && r.cfg.OverlayCIDR.Contains(addr) {
		return true, false, nil
	}
	return false, true, nil
}

func addressAnswers(question dnsmessage.Question, addr netip.Addr) []dnsmessage.Resource {
	switch question.Type {
	case dnsmessage.TypeA:
		if addr.Is4() {
			return []dnsmessage.Resource{aResource(question.Name, addr)}
		}
	case dnsmessage.TypeAAAA:
		if addr.Is6() {
			return []dnsmessage.Resource{aaaaResource(question.Name, addr)}
		}
	case dnsmessage.TypeALL:
		if addr.Is4() {
			return []dnsmessage.Resource{aResource(question.Name, addr)}
		}
		if addr.Is6() {
			return []dnsmessage.Resource{aaaaResource(question.Name, addr)}
		}
	}
	return nil
}

func aResource(name dnsmessage.Name, addr netip.Addr) dnsmessage.Resource {
	return dnsmessage.Resource{
		Header: dnsmessage.ResourceHeader{Name: name, Type: dnsmessage.TypeA, Class: dnsmessage.ClassINET, TTL: dnsDefaultTTL},
		Body:   &dnsmessage.AResource{A: addr.As4()},
	}
}

func aaaaResource(name dnsmessage.Name, addr netip.Addr) dnsmessage.Resource {
	return dnsmessage.Resource{
		Header: dnsmessage.ResourceHeader{Name: name, Type: dnsmessage.TypeAAAA, Class: dnsmessage.ClassINET, TTL: dnsDefaultTTL},
		Body:   &dnsmessage.AAAAResource{AAAA: addr.As16()},
	}
}

func ptrAnswer(question dnsmessage.Question, name string) dnsmessage.Resource {
	return dnsmessage.Resource{
		Header: dnsmessage.ResourceHeader{Name: question.Name, Type: dnsmessage.TypePTR, Class: dnsmessage.ClassINET, TTL: dnsDefaultTTL},
		Body:   &dnsmessage.PTRResource{PTR: dnsmessage.MustNewName(name)},
	}
}

func packDNSResponse(
	query dnsmessage.Message,
	answers []dnsmessage.Resource,
	rcode dnsmessage.RCode,
) ([]byte, error) {
	response := dnsmessage.Message{
		Header: dnsmessage.Header{
			ID:                 query.Header.ID,
			Response:           true,
			OpCode:             query.Header.OpCode,
			Authoritative:      rcode == dnsmessage.RCodeSuccess && len(answers) > 0,
			RecursionDesired:   query.Header.RecursionDesired,
			RecursionAvailable: true,
			RCode:              rcode,
		},
		Questions: query.Questions,
		Answers:   answers,
	}
	return response.Pack()
}

func errorDNSResponse(query []byte, rcode dnsmessage.RCode) ([]byte, error) {
	var parser dnsmessage.Parser
	header, _ := parser.Start(query)
	response := dnsmessage.Message{
		Header: dnsmessage.Header{
			ID:                 header.ID,
			OpCode:             header.OpCode,
			RecursionDesired:   header.RecursionDesired,
			RecursionAvailable: true,
			RCode:              rcode,
			Response:           true,
		},
	}
	return response.Pack()
}

func forwardDNSQuery(query []byte, forwarder string, network string) ([]byte, error) {
	switch network {
	case "tcp":
		return forwardTCPDNSQuery(query, forwarder)
	default:
		return forwardUDPDNSQuery(query, forwarder)
	}
}

func forwardUDPDNSQuery(query []byte, forwarder string) ([]byte, error) {
	conn, err := net.DialTimeout("udp", forwarder, dnsForwardTimeout)
	if err != nil {
		return nil, err
	}
	defer conn.Close()

	if err := conn.SetDeadline(time.Now().Add(dnsForwardTimeout)); err != nil {
		return nil, err
	}
	if _, err := conn.Write(query); err != nil {
		return nil, err
	}

	response := make([]byte, dnsMaxUDPPacket)
	n, err := conn.Read(response)
	if err != nil {
		return nil, err
	}
	response = response[:n]
	return finishForwardedUDPResponse(query, response, n == dnsMaxUDPPacket, func() ([]byte, error) {
		return forwardTCPDNSQuery(query, forwarder)
	})
}

func finishForwardedUDPResponse(
	query []byte,
	response []byte,
	fullBuffer bool,
	retryTCP func() ([]byte, error),
) ([]byte, error) {
	if !fullBuffer && !dnsResponseTruncated(response) {
		return response, nil
	}

	tcpResponse, err := retryTCP()
	if err != nil {
		return response, nil
	}
	if len(tcpResponse) > dnsMaxUDPPacket {
		return truncatedDNSResponse(query)
	}
	return tcpResponse, nil
}

func forwardTCPDNSQuery(query []byte, forwarder string) ([]byte, error) {
	if len(query) > dnsMaxTCPPacket {
		return nil, fmt.Errorf("dns tcp query is too large: %d bytes", len(query))
	}

	conn, err := net.DialTimeout("tcp", forwarder, dnsForwardTimeout)
	if err != nil {
		return nil, err
	}
	defer conn.Close()

	if err := conn.SetDeadline(time.Now().Add(dnsForwardTimeout)); err != nil {
		return nil, err
	}

	var lengthBuf [2]byte
	binary.BigEndian.PutUint16(lengthBuf[:], uint16(len(query)))
	if _, err := conn.Write(append(lengthBuf[:], query...)); err != nil {
		return nil, err
	}

	if _, err := io.ReadFull(conn, lengthBuf[:]); err != nil {
		return nil, err
	}
	length := int(binary.BigEndian.Uint16(lengthBuf[:]))
	if length == 0 || length > dnsMaxTCPPacket {
		return nil, fmt.Errorf("invalid dns tcp response length: %d", length)
	}

	response := make([]byte, length)
	if _, err := io.ReadFull(conn, response); err != nil {
		return nil, err
	}
	return response, nil
}

func dnsForwarderAddr() string {
	raw := strings.TrimSpace(os.Getenv("ROUTER_DNS_FORWARDER"))
	if raw == "" {
		return defaultDNSForwardAddr
	}
	if _, _, err := net.SplitHostPort(raw); err == nil {
		return raw
	}
	return net.JoinHostPort(raw, "53")
}

func dnsResponseTruncated(response []byte) bool {
	var message dnsmessage.Message
	return message.Unpack(response) == nil && message.Header.Truncated
}

func truncatedDNSResponse(query []byte) ([]byte, error) {
	var message dnsmessage.Message
	if err := message.Unpack(query); err != nil {
		return errorDNSResponse(query, dnsmessage.RCodeFormatError)
	}
	response := dnsmessage.Message{
		Header: dnsmessage.Header{
			ID:                 message.Header.ID,
			Response:           true,
			OpCode:             message.Header.OpCode,
			Truncated:          true,
			RecursionDesired:   message.Header.RecursionDesired,
			RecursionAvailable: true,
			RCode:              dnsmessage.RCodeSuccess,
		},
		Questions: message.Questions,
	}
	return response.Pack()
}

func normalizeDNSName(name string) string {
	name = strings.TrimSpace(strings.ToLower(name))
	name = strings.TrimSuffix(name, ".")
	if name == "" {
		return "."
	}
	return name + "."
}

func isReverseDNSName(name string) bool {
	return strings.HasSuffix(name, ".in-addr.arpa.") || strings.HasSuffix(name, ".ip6.arpa.")
}

func reverseName(addr netip.Addr) (string, bool) {
	if addr.Is4() {
		octets := addr.As4()
		return fmt.Sprintf("%d.%d.%d.%d.in-addr.arpa.", octets[3], octets[2], octets[1], octets[0]), true
	}
	if addr.Is6() {
		bytes := addr.As16()
		nibbles := make([]string, 0, 32)
		for i := len(bytes) - 1; i >= 0; i-- {
			nibbles = append(nibbles, fmt.Sprintf("%x", bytes[i]&0x0f))
			nibbles = append(nibbles, fmt.Sprintf("%x", bytes[i]>>4))
		}
		return strings.Join(nibbles, ".") + ".ip6.arpa.", true
	}
	return "", false
}

func reverseAddr(name string) (netip.Addr, bool) {
	name = normalizeDNSName(name)
	if strings.HasSuffix(name, ".in-addr.arpa.") {
		trimmed := strings.TrimSuffix(name, ".in-addr.arpa.")
		parts := strings.Split(trimmed, ".")
		if len(parts) != 4 {
			return netip.Addr{}, false
		}
		for i, j := 0, len(parts)-1; i < j; i, j = i+1, j-1 {
			parts[i], parts[j] = parts[j], parts[i]
		}
		addr, err := netip.ParseAddr(strings.Join(parts, "."))
		if err != nil || !addr.Is4() {
			return netip.Addr{}, false
		}
		return addr, true
	}

	if strings.HasSuffix(name, ".ip6.arpa.") {
		trimmed := strings.TrimSuffix(name, ".ip6.arpa.")
		parts := strings.Split(trimmed, ".")
		if len(parts) != 32 {
			return netip.Addr{}, false
		}
		nibbles := make([]byte, 0, 32)
		for i := len(parts) - 1; i >= 0; i-- {
			if len(parts[i]) != 1 {
				return netip.Addr{}, false
			}
			nibbles = append(nibbles, parts[i][0])
		}
		groups := make([]string, 0, 8)
		for i := 0; i < len(nibbles); i += 4 {
			groups = append(groups, string(nibbles[i:i+4]))
		}
		addr, err := netip.ParseAddr(strings.Join(groups, ":"))
		if err != nil || !addr.Is6() {
			return netip.Addr{}, false
		}
		return addr, true
	}

	return netip.Addr{}, false
}
