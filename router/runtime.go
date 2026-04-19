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

	overlays, err := buildOverlayRuntimes(cfg.Overlays)
	if err != nil {
		closeOverlayRuntimes(overlays)
		return nil, err
	}

	protocols, err := buildProtocols(cfg, overlays)
	if err != nil {
		closeOverlayRuntimes(overlays)
		return nil, err
	}

	return &routerRuntime{
		cfg:       cfg,
		overlays:  overlays,
		protocols: protocols,
	}, nil
}

func buildOverlayRuntimes(overlays []namedOverlayConfig) (map[string]*overlayRuntime, error) {
	runtimes := make(map[string]*overlayRuntime, len(overlays))
	for _, overlay := range overlays {
		tun, tnet, err := createUserspaceNetstack([]netip.Addr{overlay.Config.ServerAddr}, nil, overlay.Config.MTU)
		if err != nil {
			closeOverlayRuntimes(runtimes)
			return nil, fmt.Errorf("create userspace netstack TUN for overlay %q: %w", overlay.Name, err)
		}

		runtimes[overlay.Name] = &overlayRuntime{
			name: overlay.Name,
			cfg:  overlay.Config,
			tun:  tun,
			net:  tnet,
		}
	}

	return runtimes, nil
}

func closeOverlayRuntimes(overlays map[string]*overlayRuntime) {
	for _, overlay := range overlays {
		if overlay != nil && overlay.tun != nil {
			_ = overlay.tun.Close()
		}
	}
}

func buildProtocols(cfg routerConfig, overlays map[string]*overlayRuntime) ([]protocolInstance, error) {
	nextHostBySubnet := make(map[string]int)
	instances := make([]protocolInstance, 0, len(cfg.Protocols))
	wireGuardEndpoints := make(map[string]*sharedWireGuardEndpoint)
	wireGuardServerIDs := make(map[string]wireGuardIdentity)

	for _, protocolCfg := range cfg.Protocols {
		overlay := overlays[protocolCfg.OverlayName]
		if overlay == nil {
			return nil, fmt.Errorf("overlay runtime %q was not initialized", protocolCfg.OverlayName)
		}

		factory, err := selectTunnelProtocol(protocolCfg.Name)
		if err != nil {
			return nil, fmt.Errorf("select protocol %q: %w", protocolCfg.InstanceName, err)
		}

		clientCount, err := factory.ClientCount(protocolCfg)
		if err != nil {
			return nil, fmt.Errorf("count clients for %q: %w", protocolCfg.InstanceName, err)
		}

		clientSubnet, err := factory.ClientSubnet(protocolCfg, overlay.cfg)
		if err != nil {
			return nil, fmt.Errorf("select client subnet for %q: %w", protocolCfg.InstanceName, err)
		}

		clientAddrs := make([]netip.Addr, 0, clientCount)
		subnetKey := fmt.Sprintf("%s|%s", overlay.name, clientSubnet.String())
		nextHost := nextHostBySubnet[subnetKey]
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
			if clientSubnet == overlay.cfg.OverlayCIDR && candidate == overlay.cfg.ServerAddr {
				continue
			}

			clientAddrs = append(clientAddrs, candidate)
		}
		nextHostBySubnet[subnetKey] = nextHost

		build := protocolBuild{
			OverlayName: protocolCfg.OverlayName,
			Overlay:     overlay.cfg,
			Config:      protocolCfg,
			OverlayLink: overlay,
			ClientAddrs: clientAddrs,
		}

		if normalizeProtocolName(protocolCfg.Name) == "wireguard" {
			endpointKey := sharedWireGuardEndpointKey(protocolCfg)
			endpoint := wireGuardEndpoints[endpointKey]
			if endpoint == nil {
				endpoint = newSharedWireGuardEndpoint(protocolCfg.ListenPort)
				wireGuardEndpoints[endpointKey] = endpoint

				serverID, err := generateWireGuardIdentity()
				if err != nil {
					return nil, fmt.Errorf("generate shared wireguard identity for %q: %w", protocolCfg.InstanceName, err)
				}
				wireGuardServerIDs[endpointKey] = serverID
			}

			serverID := wireGuardServerIDs[endpointKey]
			build.WireGuardBind = endpoint.NewBind(protocolCfg.InstanceName)
			build.WireGuardServerID = &serverID
		}

		instance, err := factory.Build(build)
		if err != nil {
			return nil, fmt.Errorf("build protocol %q: %w", protocolCfg.InstanceName, err)
		}
		overlay.protocols = append(overlay.protocols, instance)
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
	for _, overlay := range r.overlays {
		if err := startStatusServer(overlay.net, overlay.cfg, overlay.protocols); err != nil {
			return fmt.Errorf("start userspace netstack status server for overlay %q: %w", overlay.name, err)
		}
	}
	return nil
}

func (r *routerRuntime) close() {
	for i := len(r.protocols) - 1; i >= 0; i-- {
		r.protocols[i].Close()
	}
	for _, overlay := range r.overlays {
		if overlay != nil && overlay.tun != nil {
			_ = overlay.tun.Close()
		}
	}
}
