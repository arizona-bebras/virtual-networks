package main

import (
	"encoding/binary"
	"fmt"
	"log"
	"time"

	"golang.zx2c4.com/wireguard/conn"
	"golang.zx2c4.com/wireguard/device"
)

func (s singleBackendSelector) SelectInbound(_ []byte, _ conn.Endpoint, _ packetMetadata) string {
	return s.backendName
}

func (b *frontendBind) Open(port uint16) ([]conn.ReceiveFunc, uint16, error) {
	receiveFns, actualPort, err := b.inner.Open(port)
	if err != nil {
		return nil, 0, err
	}

	wrapped := make([]conn.ReceiveFunc, 0, len(receiveFns))
	for _, receiveFn := range receiveFns {
		current := receiveFn
		wrapped = append(wrapped, func(packets [][]byte, sizes []int, eps []conn.Endpoint) (int, error) {
			n, err := current(packets, sizes, eps)
			for i := 0; i < n; i++ {
				if sizes[i] <= 0 || sizes[i] > len(packets[i]) || eps[i] == nil {
					continue
				}
				packet := packets[i][:sizes[i]]
				meta := parsePacketMetadata(packet)
				backend := b.selector.SelectInbound(packet, eps[i], meta)
				b.logger.Record(eps[i], backend, meta)
			}
			return n, err
		})
	}

	return wrapped, actualPort, nil
}

func (b *frontendBind) Close() error {
	return b.inner.Close()
}

func (b *frontendBind) SetMark(mark uint32) error {
	return b.inner.SetMark(mark)
}

func (b *frontendBind) Send(bufs [][]byte, ep conn.Endpoint) error {
	return b.inner.Send(bufs, ep)
}

func (b *frontendBind) ParseEndpoint(s string) (conn.Endpoint, error) {
	return b.inner.ParseEndpoint(s)
}

func (b *frontendBind) BatchSize() int {
	return b.inner.BatchSize()
}

func (l *peerObservationLog) Record(ep conn.Endpoint, backend string, meta packetMetadata) {
	key := ep.DstToString()
	now := time.Now().UTC()

	l.mu.Lock()
	defer l.mu.Unlock()

	entry, ok := l.byEndpoint[key]
	if !ok {
		entry = &peerObservation{
			Endpoint:  key,
			FirstSeen: now,
		}
		l.byEndpoint[key] = entry
	}

	entry.LastSeen = now
	entry.LastBackend = backend
	entry.LastPacketType = meta.TypeName
	entry.LastSenderIndex = meta.SenderIndex
	entry.LastReceiverIndex = meta.ReceiverIndex
	entry.Packets++

	if meta.SenderIndex != 0 {
		l.bySenderIdx[meta.SenderIndex] = key
	}
	if meta.ReceiverIndex != 0 {
		l.byReceiverIx[meta.ReceiverIndex] = key
	}

	log.Printf(
		"frontend: endpoint=%s backend=%s packet_type=%s size=%d sender_idx=%d receiver_idx=%d",
		key,
		backend,
		meta.TypeName,
		meta.Size,
		meta.SenderIndex,
		meta.ReceiverIndex,
	)
}

func (l *peerObservationLog) Snapshot() []peerObservation {
	l.mu.RLock()
	defer l.mu.RUnlock()

	out := make([]peerObservation, 0, len(l.byEndpoint))
	for _, entry := range l.byEndpoint {
		out = append(out, *entry)
	}
	return out
}

func parsePacketMetadata(packet []byte) packetMetadata {
	meta := packetMetadata{
		TypeName: "unknown",
		Size:     len(packet),
	}
	if len(packet) < 4 {
		return meta
	}

	meta.Type = binary.LittleEndian.Uint32(packet[:4])
	switch meta.Type {
	case device.MessageInitiationType:
		meta.TypeName = "handshake-initiation"
		if len(packet) >= device.MessageInitiationSize {
			meta.SenderIndex = binary.LittleEndian.Uint32(packet[4:8])
		}
	case device.MessageResponseType:
		meta.TypeName = "handshake-response"
		if len(packet) >= device.MessageResponseSize {
			meta.SenderIndex = binary.LittleEndian.Uint32(packet[4:8])
			meta.ReceiverIndex = binary.LittleEndian.Uint32(packet[8:12])
		}
	case device.MessageCookieReplyType:
		meta.TypeName = "cookie-reply"
		if len(packet) >= device.MessageCookieReplySize {
			meta.ReceiverIndex = binary.LittleEndian.Uint32(packet[4:8])
		}
	case device.MessageTransportType:
		meta.TypeName = "transport"
		if len(packet) >= device.MessageTransportHeaderSize {
			meta.ReceiverIndex = binary.LittleEndian.Uint32(packet[4:8])
		}
	default:
		meta.TypeName = fmt.Sprintf("unknown-%d", meta.Type)
	}

	return meta
}
