package router

import (
	"net/netip"

	"router/internal/netstack"

	"golang.zx2c4.com/wireguard/conn"
	"golang.zx2c4.com/wireguard/tun"
)

type Config struct {
	Overlays  []NamedOverlayConfig
	Protocols []ProtocolConfig
}

type NamedOverlayConfig struct {
	Name   string
	Config OverlayConfig
}

type OverlayConfig struct {
	MTU         int
	ServerAddr  netip.Addr
	OverlayCIDR netip.Prefix
	StatusPort  int
}

type ProtocolConfig struct {
	Name         string
	InstanceName string
	OverlayName  string
	ListenPort   uint16
	PublicHost   string
	WireGuard    *WireGuardProtocolConfig
}

type WireGuardProtocolConfig struct {
	PeerCount    int
	KeepaliveSec int
}

type Runtime struct {
	cfg       Config
	overlays  map[string]*overlayRuntime
	protocols []ProtocolInstance
}

type overlayRuntime struct {
	name      string
	cfg       OverlayConfig
	tun       *netstack.Hub
	net       *netstack.Network
	protocols []ProtocolInstance
}

type ProtocolBuild struct {
	OverlayName       string
	Overlay           OverlayConfig
	Config            ProtocolConfig
	AttachTUN         func(name string, routes []netip.Addr) tun.Device
	ClientAddrs       []netip.Addr
	WireGuardBind     conn.Bind
	WireGuardServerID *WireGuardIdentity
	PeerObservations  func(backend string) []PeerObservation
}

type TunnelProtocol interface {
	Name() string
	ClientCount(cfg ProtocolConfig) (int, error)
	ClientSubnet(cfg ProtocolConfig, overlay OverlayConfig) (netip.Prefix, error)
	Build(build ProtocolBuild) (ProtocolInstance, error)
}

type ProtocolInstance interface {
	Name() string
	InstanceName() string
	OverlayName() string
	Start() error
	Close()
	BootstrapInfo() ProtocolBootstrapInfo
	StatusInfo(requesterAddr string) ProtocolStatusInfo
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
