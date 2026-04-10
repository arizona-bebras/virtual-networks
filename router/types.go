package main

import (
	"net/netip"
	"sync"
	"time"

	"golang.zx2c4.com/wireguard/conn"
	"golang.zx2c4.com/wireguard/device"
)

type wireGuardIdentity struct {
	Private [32]byte
	Public  [32]byte
}

type peer struct {
	Name     string
	Identity wireGuardIdentity
	Addr     netip.Addr
}

type serverConfig struct {
	ListenPort   uint16
	MTU          int
	PeerCount    int
	ServerAddr   netip.Addr
	OverlayCIDR  netip.Prefix
	PublicHost   string
	KeepaliveSec int
}

type routerRuntime struct {
	cfg      serverConfig
	serverID wireGuardIdentity
	peers    []peer

	frontend *frontendBind
	backend  *backendInstance
}

type backendInstance struct {
	name   string
	device *device.Device
	tun    interface{ Close() error }
	net    *userspaceNetstack
}

type frontendBind struct {
	inner    conn.Bind
	logger   *peerObservationLog
	selector backendSelector
}

type backendSelector interface {
	SelectInbound(packet []byte, ep conn.Endpoint, meta packetMetadata) string
}

type singleBackendSelector struct {
	backendName string
}

type peerObservationLog struct {
	mu           sync.RWMutex
	byEndpoint   map[string]*peerObservation
	bySenderIdx  map[uint32]string
	byReceiverIx map[uint32]string
}

type peerObservation struct {
	Endpoint          string
	FirstSeen         time.Time
	LastSeen          time.Time
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
