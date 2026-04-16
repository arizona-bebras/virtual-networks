package main

import (
	"fmt"
	"net/netip"
)

func newRouterRuntime() (*routerRuntime, error) {
	cfg, err := loadConfig()
	if err != nil {
		return nil, fmt.Errorf("load config: %w", err)
	}

	tun, tnet, err := createUserspaceNetstack([]netip.Addr{cfg.Overlay.ServerAddr}, nil, cfg.Overlay.MTU)
	if err != nil {
		return nil, fmt.Errorf("create userspace netstack TUN: %w", err)
	}

	overlay := &overlayRuntime{
		tun: tun,
		net: tnet,
	}

	protocols, err := buildProtocols(cfg, overlay)
	if err != nil {
		_ = overlay.tun.Close()
		return nil, err
	}

	return &routerRuntime{
		cfg:       cfg,
		overlay:   overlay,
		protocols: protocols,
	}, nil
}

func buildProtocols(cfg routerConfig, overlay *overlayRuntime) ([]protocolInstance, error) {
	nextHostBySubnet := make(map[string]int)
	instances := make([]protocolInstance, 0, len(cfg.Protocols))

	for _, protocolCfg := range cfg.Protocols {
		factory, err := selectTunnelProtocol(protocolCfg.Name)
		if err != nil {
			return nil, fmt.Errorf("select protocol %q: %w", protocolCfg.InstanceName, err)
		}

		clientCount, err := factory.ClientCount(protocolCfg)
		if err != nil {
			return nil, fmt.Errorf("count clients for %q: %w", protocolCfg.InstanceName, err)
		}

		clientSubnet, err := factory.ClientSubnet(protocolCfg, cfg.Overlay)
		if err != nil {
			return nil, fmt.Errorf("select client subnet for %q: %w", protocolCfg.InstanceName, err)
		}

		clientAddrs := make([]netip.Addr, 0, clientCount)
		nextHost := nextHostBySubnet[clientSubnet.String()]
		if nextHost == 0 {
			nextHost = 2
		}
		networkBase := clientSubnet.Addr().As4()
		for len(clientAddrs) < clientCount {
			candidate := netip.AddrFrom4([4]byte{networkBase[0], networkBase[1], networkBase[2], byte(nextHost)})
			nextHost++

			if !clientSubnet.Contains(candidate) {
				return nil, fmt.Errorf("subnet %s does not have enough addresses for configured protocol clients", clientSubnet)
			}
			if clientSubnet == cfg.Overlay.OverlayCIDR && candidate == cfg.Overlay.ServerAddr {
				continue
			}

			clientAddrs = append(clientAddrs, candidate)
		}
		nextHostBySubnet[clientSubnet.String()] = nextHost

		instance, err := factory.Build(protocolBuild{
			Overlay:     cfg.Overlay,
			Config:      protocolCfg,
			OverlayLink: overlay,
			ClientAddrs: clientAddrs,
		})
		if err != nil {
			return nil, fmt.Errorf("build protocol %q: %w", protocolCfg.InstanceName, err)
		}
		instances = append(instances, instance)
	}

	return instances, nil
}

func (r *routerRuntime) start() error {
	for _, protocol := range r.protocols {
		if err := protocol.Start(); err != nil {
			return fmt.Errorf("start %s: %w", protocol.InstanceName(), err)
		}
	}
	if err := startStatusServer(r.overlay.net, r.cfg.Overlay, r.protocols); err != nil {
		return fmt.Errorf("start userspace netstack status server: %w", err)
	}
	return nil
}

func (r *routerRuntime) close() {
	for i := len(r.protocols) - 1; i >= 0; i-- {
		r.protocols[i].Close()
	}
	if r.overlay != nil && r.overlay.tun != nil {
		_ = r.overlay.tun.Close()
	}
}
