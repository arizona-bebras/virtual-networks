package wgshared

import (
	"encoding/binary"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"

	"golang.zx2c4.com/wireguard/conn"
	"golang.zx2c4.com/wireguard/device"
)

type Observation struct {
	Endpoint          string
	LastBackend       string
	LastPacketType    string
	LastSenderIndex   uint32
	LastReceiverIndex uint32
	Packets           uint64
}

type packetMetadata struct {
	Type          uint32
	TypeName      string
	SenderIndex   uint32
	ReceiverIndex uint32
	Size          int
}

type observerLog struct {
	mu           sync.RWMutex
	byEndpoint   map[string]*endpointObservation
	bySenderIdx  map[uint32]string
	byReceiverIx map[uint32]string
}

type endpointObservation struct {
	Endpoint          string
	FirstSeen         time.Time
	LastSeen          time.Time
	LastBackend       string
	LastPacketType    string
	LastSenderIndex   uint32
	LastReceiverIndex uint32
	Packets           uint64
}

func newObserverLog() *observerLog {
	return &observerLog{
		byEndpoint:   make(map[string]*endpointObservation),
		bySenderIdx:  make(map[uint32]string),
		byReceiverIx: make(map[uint32]string),
	}
}

func (l *observerLog) record(ep conn.Endpoint, backend string, meta packetMetadata) {
	key := ep.DstToString()
	now := time.Now().UTC()

	l.mu.Lock()
	defer l.mu.Unlock()

	entry, ok := l.byEndpoint[key]
	if !ok {
		entry = &endpointObservation{Endpoint: key, FirstSeen: now}
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
		key, backend, meta.TypeName, meta.Size, meta.SenderIndex, meta.ReceiverIndex,
	)
}

func (l *observerLog) SnapshotForBackend(backend string) []Observation {
	l.mu.RLock()
	defer l.mu.RUnlock()

	out := make([]Observation, 0, len(l.byEndpoint))
	for _, entry := range l.byEndpoint {
		if backend != "" && entry.LastBackend != backend && !strings.Contains(entry.LastBackend, backend) {
			continue
		}
		out = append(out, Observation{
			Endpoint:          entry.Endpoint,
			LastBackend:       entry.LastBackend,
			LastPacketType:    entry.LastPacketType,
			LastSenderIndex:   entry.LastSenderIndex,
			LastReceiverIndex: entry.LastReceiverIndex,
			Packets:           entry.Packets,
		})
	}
	return out
}

func parsePacketMetadata(packet []byte) packetMetadata {
	meta := packetMetadata{TypeName: "unknown", Size: len(packet)}
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
