package main

import (
	"net/netip"

	"golang.zx2c4.com/wireguard/conn"
)

type routerConfig struct {
	Overlays  []namedOverlayConfig
	Protocols []protocolConfig
}

type namedOverlayConfig struct {
	Name   string
	Config overlayConfig
}

type overlayConfig struct {
	MTU         int
	ServerAddr  netip.Addr
	OverlayCIDR netip.Prefix
	StatusPort  int
}

type protocolConfig struct {
	Name         string
	InstanceName string
	OverlayName  string
	ListenPort   uint16
	PublicHost   string
	WireGuard    *wireGuardProtocolConfig
}

type wireGuardProtocolConfig struct {
	PeerCount    int
	KeepaliveSec int
}

type routerRuntime struct {
	cfg       routerConfig
	overlays  map[string]*overlayRuntime
	protocols []protocolInstance
}

type overlayRuntime struct {
	name      string
	cfg       overlayConfig
	tun       *userspaceTun
	net       *userspaceNetstack
	protocols []protocolInstance
}

type protocolBuild struct {
	OverlayName       string
	Overlay           overlayConfig
	Config            protocolConfig
	OverlayLink       *overlayRuntime
	ClientAddrs       []netip.Addr
	WireGuardBind     conn.Bind
	WireGuardServerID *wireGuardIdentity
}

type tunnelProtocol interface {
	Name() string
	ClientCount(cfg protocolConfig) (int, error)
	ClientSubnet(cfg protocolConfig, overlay overlayConfig) (netip.Prefix, error)
	Build(build protocolBuild) (protocolInstance, error)
}

type protocolInstance interface {
	Name() string
	InstanceName() string
	OverlayName() string
	Start() error
	Close()
	BootstrapInfo() protocolBootstrapInfo
	StatusInfo(requesterAddr string) protocolStatusInfo
}

type protocolBootstrapInfo struct {
	DisplayName    string
	ListenEndpoint string
	ServerDetails  []string
	ClientProfiles []clientProfile
	Postscript     string
}

type clientProfile struct {
	Name   string
	Config string
}

type protocolStatusInfo struct {
	DisplayName string
	Lines       []string
}
