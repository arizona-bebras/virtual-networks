package router

import (
	"net/netip"
	"sync"
	"time"

	"router/internal/netstack"

	"golang.zx2c4.com/wireguard/conn"
	"golang.zx2c4.com/wireguard/tun"
)

type Config struct {
	Overlays  []OverlayConfig
	Protocols []ProtocolConfig
}

type OverlayConfig struct {
	NetworkID   string
	MTU         int
	ServerAddr  netip.Addr
	OverlayCIDR netip.Prefix
	StatusPort  int
}

type ProtocolConfig struct {
	ID         string
	Name       string
	NetworkID  string
	ListenPort uint16
	PublicHost string
	PeerIDs    []string
	WireGuard  *WireGuardProtocolConfig
}

type WireGuardProtocolConfig struct {
	KeepaliveSec        int
	InterfacePrivateKey *[32]byte
	InterfacePublicKey  *[32]byte
	Peers               []WireGuardPeerConfig
}

type WireGuardPeerConfig struct {
	ID           string
	Addr         netip.Addr
	PublicKey    [32]byte
	PresharedKey *[32]byte
}

type PeerConnectionReport struct {
	NetworkID          string
	ProtocolInstanceID string
	PeerID             string
	Endpoint           string
	Connected          bool
	LatestHandshakeAt  time.Time
	RxBytes            uint64
	TxBytes            uint64
}

type Runtime struct {
	mu           sync.Mutex
	cfg          Config
	revision     string
	overlays     map[string]*overlayRuntime
	protocols    []ProtocolInstance
	closers      []func() error
	metricsClose func() error
	controlPlane *controlPlaneClient
	configWatch  *configurationWatch
}

type overlayRuntime struct {
	networkID string
	cfg       OverlayConfig
	tun       *netstack.Hub
	net       *netstack.Network
	protocols []ProtocolInstance
}

type ProtocolBuild struct {
	NetworkID        string
	Overlay          OverlayConfig
	Config           ProtocolConfig
	AttachTUN        func(name string, routes []netip.Addr) tun.Device
	ClientAddrs      []netip.Addr
	WireGuardBind    conn.Bind
	PeerObservations func(backend string) []PeerObservation
}

type TunnelProtocol interface {
	Name() string
	ClientCount(cfg ProtocolConfig) (int, error)
	ClientSubnet(cfg ProtocolConfig, overlay OverlayConfig) (netip.Prefix, error)
	Build(build ProtocolBuild) (ProtocolInstance, error)
}

type ProtocolInstance interface {
	Name() string
	ID() string
	NetworkID() string
	Start() error
	Close()
	BootstrapInfo() ProtocolBootstrapInfo
	StatusInfo(requesterAddr string) ProtocolStatusInfo
}

type ConnectionReporter interface {
	ConnectionReports() ([]PeerConnectionReport, error)
}

type ProtocolBootstrapInfo struct {
	DisplayName    string
	ListenEndpoint string
	ServerDetails  []string
	ClientProfiles []ClientProfile
	Postscript     string
}

type ClientProfile struct {
	Name   string
	Config string
}

type ProtocolStatusInfo struct {
	DisplayName string
	Lines       []string
}

type PeerObservation struct {
	Endpoint          string
	LastBackend       string
	LastPacketType    string
	LastSenderIndex   uint32
	LastReceiverIndex uint32
	Packets           uint64
}
