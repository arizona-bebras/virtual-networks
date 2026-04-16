package main

import "net/netip"

type routerConfig struct {
	Overlay   overlayConfig
	Protocols []protocolConfig
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
	overlay   *overlayRuntime
	protocols []protocolInstance
}

type overlayRuntime struct {
	tun *userspaceTun
	net *userspaceNetstack
}

type protocolBuild struct {
	Overlay     overlayConfig
	Config      protocolConfig
	OverlayLink *overlayRuntime
	ClientAddrs []netip.Addr
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
	Start() error
	Close()
	BootstrapInfo(overlay overlayConfig) protocolBootstrapInfo
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
