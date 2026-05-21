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
)

const (
	dnsPort               = 53
	dnsDefaultTTL         = 60
	dnsForwardTimeout     = 5 * time.Second
	dnsMaxUDPPacket       = 1232
	dnsMaxTCPPacket       = 65535
	defaultDNSForwardAddr = "1.1.1.1:53"

	dnsTypeA    uint16 = 1
	dnsTypePTR  uint16 = 12
	dnsTypeAAAA uint16 = 28
	dnsTypeANY  uint16 = 255

	dnsClassIN uint16 = 1

	dnsRCodeFormatError = 1
	dnsRCodeNameError   = 3
)

type dnsResolver struct {
	cfg        OverlayConfig
	forwarder  string
	records    map[string]netip.Addr
	ptrRecords map[string]string
}

type dnsQuestion struct {
	Name   string
	QType  uint16
	QClass uint16
	Raw    []byte
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
		"router.internal.": overlay.ServerAddr,
	}

	for _, protocol := range protocols {
		if protocol.NetworkID != overlay.NetworkID || protocol.WireGuard == nil {
			continue
		}
		for _, peer := range protocol.WireGuard.Peers {
			name := normalizeDNSName(peer.ID + ".internal")
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
			response, err := r.resolve(query)
			if err != nil {
				log.Printf("dns udp query for network %q: %v", r.cfg.NetworkID, err)
				return
			}
			if len(response) > dnsMaxUDPPacket {
				response = truncateDNSResponse(response)
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

		response, err := r.resolve(query)
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

func (r *dnsResolver) resolve(query []byte) ([]byte, error) {
	questions, questionEnd, err := parseDNSQuestions(query)
	if err != nil {
		return buildDNSError(query, dnsRCodeFormatError), nil
	}
	if len(questions) == 0 {
		return buildDNSResponse(query, questionEnd, nil, 0), nil
	}

	private, answers, nameExists := r.privateAnswers(questions)
	if private {
		rcode := 0
		if !nameExists {
			rcode = dnsRCodeNameError
		}
		return buildDNSResponse(query, questionEnd, answers, rcode), nil
	}

	return forwardDNSQuery(query, r.forwarder)
}

func (r *dnsResolver) privateAnswers(questions []dnsQuestion) (bool, [][]byte, bool) {
	private := false
	nameExists := true
	var answers [][]byte

	for _, question := range questions {
		if question.QClass != dnsClassIN {
			continue
		}

		switch {
		case strings.HasSuffix(question.Name, ".internal."):
			private = true
			addr, ok := r.records[question.Name]
			if !ok {
				nameExists = false
				continue
			}
			answers = append(answers, addressAnswers(question, addr)...)
		case isReverseDNSName(question.Name):
			if ptr, ok := r.ptrRecords[question.Name]; ok {
				private = true
				if question.QType != dnsTypePTR && question.QType != dnsTypeANY {
					continue
				}
				answers = append(answers, ptrAnswer(question, ptr))
				continue
			}
			if addr, ok := reverseAddr(question.Name); ok && r.cfg.OverlayCIDR.Contains(addr) {
				private = true
				nameExists = false
			}
		}
	}

	return private, answers, nameExists
}

func addressAnswers(question dnsQuestion, addr netip.Addr) [][]byte {
	switch question.QType {
	case dnsTypeA:
		if addr.Is4() {
			return [][]byte{resourceRecord(question.Raw, dnsTypeA, addr.AsSlice())}
		}
	case dnsTypeAAAA:
		if addr.Is6() {
			return [][]byte{resourceRecord(question.Raw, dnsTypeAAAA, addr.AsSlice())}
		}
	case dnsTypeANY:
		if addr.Is4() {
			return [][]byte{resourceRecord(question.Raw, dnsTypeA, addr.AsSlice())}
		}
		if addr.Is6() {
			return [][]byte{resourceRecord(question.Raw, dnsTypeAAAA, addr.AsSlice())}
		}
	}
	return nil
}

func ptrAnswer(question dnsQuestion, name string) []byte {
	return resourceRecord(question.Raw, dnsTypePTR, encodeDNSName(name))
}

func resourceRecord(owner []byte, typ uint16, data []byte) []byte {
	rr := make([]byte, 0, len(owner)+10+len(data))
	rr = append(rr, owner...)
	rr = binary.BigEndian.AppendUint16(rr, typ)
	rr = binary.BigEndian.AppendUint16(rr, dnsClassIN)
	rr = binary.BigEndian.AppendUint32(rr, dnsDefaultTTL)
	rr = binary.BigEndian.AppendUint16(rr, uint16(len(data)))
	rr = append(rr, data...)
	return rr
}

func parseDNSQuestions(packet []byte) ([]dnsQuestion, int, error) {
	if len(packet) < 12 {
		return nil, 0, fmt.Errorf("dns packet is shorter than header")
	}
	qdCount := int(binary.BigEndian.Uint16(packet[4:6]))
	offset := 12
	questions := make([]dnsQuestion, 0, qdCount)
	for range qdCount {
		start := offset
		name, next, err := parseDNSName(packet, offset, 0)
		if err != nil {
			return nil, 0, err
		}
		offset = next
		if offset+4 > len(packet) {
			return nil, 0, fmt.Errorf("dns question is truncated")
		}
		questions = append(questions, dnsQuestion{
			Name:   normalizeDNSName(name),
			QType:  binary.BigEndian.Uint16(packet[offset : offset+2]),
			QClass: binary.BigEndian.Uint16(packet[offset+2 : offset+4]),
			Raw:    append([]byte(nil), packet[start:offset]...),
		})
		offset += 4
	}
	return questions, offset, nil
}

func parseDNSName(packet []byte, offset int, depth int) (string, int, error) {
	if depth > 16 {
		return "", 0, fmt.Errorf("dns name has too many compression pointers")
	}

	labels := []string{}
	for {
		if offset >= len(packet) {
			return "", 0, fmt.Errorf("dns name is truncated")
		}
		length := int(packet[offset])
		switch length & 0xc0 {
		case 0xc0:
			if offset+1 >= len(packet) {
				return "", 0, fmt.Errorf("dns compression pointer is truncated")
			}
			pointer := int(binary.BigEndian.Uint16(packet[offset:offset+2]) & 0x3fff)
			suffix, _, err := parseDNSName(packet, pointer, depth+1)
			if err != nil {
				return "", 0, err
			}
			if suffix != "." {
				labels = append(labels, strings.TrimSuffix(suffix, "."))
			}
			return strings.Join(labels, ".") + ".", offset + 2, nil
		case 0:
			if length == 0 {
				offset++
				if len(labels) == 0 {
					return ".", offset, nil
				}
				return strings.Join(labels, ".") + ".", offset, nil
			}
		default:
			return "", 0, fmt.Errorf("dns name uses unsupported label encoding")
		}

		offset++
		if length > 63 || offset+length > len(packet) {
			return "", 0, fmt.Errorf("dns label is truncated")
		}
		labels = append(labels, string(packet[offset:offset+length]))
		offset += length
	}
}

func encodeDNSName(name string) []byte {
	normalized := strings.TrimSuffix(normalizeDNSName(name), ".")
	if normalized == "" {
		return []byte{0}
	}
	out := []byte{}
	for _, label := range strings.Split(normalized, ".") {
		out = append(out, byte(len(label)))
		out = append(out, label...)
	}
	out = append(out, 0)
	return out
}

func buildDNSResponse(query []byte, questionEnd int, answers [][]byte, rcode int) []byte {
	if questionEnd < 12 || questionEnd > len(query) {
		questionEnd = len(query)
	}
	response := make([]byte, questionEnd, questionEnd+answerLength(answers))
	copy(response, query[:questionEnd])
	if len(response) < 12 {
		return response
	}

	queryFlags := binary.BigEndian.Uint16(query[2:4])
	flags := uint16(0x8000) | (queryFlags & 0x0100) | 0x0080 | uint16(rcode&0xf)
	if rcode == 0 && len(answers) > 0 {
		flags |= 0x0400
	}
	binary.BigEndian.PutUint16(response[2:4], flags)
	binary.BigEndian.PutUint16(response[6:8], uint16(len(answers)))
	binary.BigEndian.PutUint16(response[8:10], 0)
	binary.BigEndian.PutUint16(response[10:12], 0)
	for _, answer := range answers {
		response = append(response, answer...)
	}
	return response
}

func buildDNSError(query []byte, rcode int) []byte {
	if len(query) < 12 {
		query = append(query, make([]byte, 12-len(query))...)
	}
	response := make([]byte, len(query))
	copy(response, query)
	queryFlags := binary.BigEndian.Uint16(response[2:4])
	flags := uint16(0x8000) | (queryFlags & 0x0100) | 0x0080 | uint16(rcode&0xf)
	binary.BigEndian.PutUint16(response[2:4], flags)
	binary.BigEndian.PutUint16(response[4:6], 0)
	binary.BigEndian.PutUint16(response[6:8], 0)
	binary.BigEndian.PutUint16(response[8:10], 0)
	binary.BigEndian.PutUint16(response[10:12], 0)
	return response
}

func answerLength(answers [][]byte) int {
	total := 0
	for _, answer := range answers {
		total += len(answer)
	}
	return total
}

func truncateDNSResponse(response []byte) []byte {
	truncated := append([]byte(nil), response[:dnsMaxUDPPacket]...)
	flags := binary.BigEndian.Uint16(truncated[2:4]) | 0x0200
	binary.BigEndian.PutUint16(truncated[2:4], flags)
	return truncated
}

func forwardDNSQuery(query []byte, forwarder string) ([]byte, error) {
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
	return response[:n], nil
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
		var octets [4]byte
		for i := 0; i < 4; i++ {
			value, ok := parseByte(parts[3-i])
			if !ok {
				return netip.Addr{}, false
			}
			octets[i] = value
		}
		return netip.AddrFrom4(octets), true
	}

	if strings.HasSuffix(name, ".ip6.arpa.") {
		trimmed := strings.TrimSuffix(name, ".ip6.arpa.")
		parts := strings.Split(trimmed, ".")
		if len(parts) != 32 {
			return netip.Addr{}, false
		}
		var bytes [16]byte
		for i := 0; i < 16; i++ {
			low, ok := parseHexNibble(parts[30-(i*2)])
			if !ok {
				return netip.Addr{}, false
			}
			high, ok := parseHexNibble(parts[31-(i*2)])
			if !ok {
				return netip.Addr{}, false
			}
			bytes[i] = high<<4 | low
		}
		return netip.AddrFrom16(bytes), true
	}

	return netip.Addr{}, false
}

func parseByte(raw string) (byte, bool) {
	if raw == "" || len(raw) > 3 {
		return 0, false
	}
	var value int
	for _, ch := range raw {
		if ch < '0' || ch > '9' {
			return 0, false
		}
		value = (value * 10) + int(ch-'0')
		if value > 255 {
			return 0, false
		}
	}
	return byte(value), true
}

func parseHexNibble(raw string) (byte, bool) {
	if len(raw) != 1 {
		return 0, false
	}
	ch := raw[0]
	switch {
	case ch >= '0' && ch <= '9':
		return ch - '0', true
	case ch >= 'a' && ch <= 'f':
		return ch - 'a' + 10, true
	default:
		return 0, false
	}
}
