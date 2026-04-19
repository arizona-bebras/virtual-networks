package router

import (
	"fmt"
	"net/netip"

	"router/internal/netstack"
	"router/internal/runtimeutil"
	"router/internal/wgshared"

	"golang.zx2c4.com/wireguard/tun"
)

func NewRuntime() (*Runtime, error) {
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

	return &Runtime{
		cfg:       cfg,
		overlays:  overlays,
		protocols: protocols,
	}, nil
}

func buildOverlayRuntimes(overlays []NamedOverlayConfig) (map[string]*overlayRuntime, error) {
	runtimes := make(map[string]*overlayRuntime, len(overlays))
	for _, overlay := range overlays {
		tun, tnet, err := netstack.Create([]netip.Addr{overlay.Config.ServerAddr}, nil, overlay.Config.MTU)
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

func buildProtocols(cfg Config, overlays map[string]*overlayRuntime) ([]ProtocolInstance, error) {
	nextHostBySubnet := make(map[string]int)
	instances := make([]ProtocolInstance, 0, len(cfg.Protocols))
	wireGuardEndpoints := make(map[string]*wgshared.Endpoint)
	wireGuardServerIDs := make(map[string]WireGuardIdentity)

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

		subnetKey := fmt.Sprintf("%s|%s", overlay.name, clientSubnet.String())
		clientAddrs, nextHost, err := runtimeutil.AllocateClientAddrs(
			clientSubnet,
			overlay.cfg.ServerAddr,
			clientCount,
			nextHostBySubnet[subnetKey],
		)
		if err != nil {
			return nil, fmt.Errorf("allocate client addresses for %q: %w", protocolCfg.InstanceName, err)
		}
		nextHostBySubnet[subnetKey] = nextHost

		build := ProtocolBuild{
			OverlayName: protocolCfg.OverlayName,
			Overlay:     overlay.cfg,
			Config:      protocolCfg,
			AttachTUN: func(name string, routes []netip.Addr) tun.Device {
				return overlay.tun.Attach(name, routes)
			},
			ClientAddrs: clientAddrs,
		}

		if normalizeProtocolName(protocolCfg.Name) == "wireguard" {
			endpointKey := wgshared.Key(protocolCfg.Name, protocolCfg.ListenPort)
			endpoint := wireGuardEndpoints[endpointKey]
			if endpoint == nil {
				endpoint = wgshared.NewEndpoint(protocolCfg.ListenPort)
				wireGuardEndpoints[endpointKey] = endpoint

				serverID, err := GenerateWireGuardIdentity()
				if err != nil {
					return nil, fmt.Errorf("generate shared wireguard identity for %q: %w", protocolCfg.InstanceName, err)
				}
				wireGuardServerIDs[endpointKey] = serverID
			}

			serverID := wireGuardServerIDs[endpointKey]
			build.WireGuardBind = endpoint.NewBind(protocolCfg.InstanceName)
			build.WireGuardServerID = &serverID
			build.PeerObservations = func(backend string) []PeerObservation {
				observations := endpoint.SnapshotForBackend(backend)
				out := make([]PeerObservation, 0, len(observations))
				for _, obs := range observations {
					out = append(out, PeerObservation{
						Endpoint:          obs.Endpoint,
						LastBackend:       obs.LastBackend,
						LastPacketType:    obs.LastPacketType,
						LastSenderIndex:   obs.LastSenderIndex,
						LastReceiverIndex: obs.LastReceiverIndex,
						Packets:           obs.Packets,
					})
				}
				return out
			}
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

func (r *Runtime) Start() error {
	for _, protocol := range r.protocols {
		if err := protocol.Start(); err != nil {
			return fmt.Errorf("start %s: %w", protocol.InstanceName(), err)
		}
	}
	for _, overlayCfg := range r.cfg.Overlays {
		overlay := r.overlays[overlayCfg.Name]
		if overlay == nil {
			return fmt.Errorf("overlay runtime %q is missing", overlayCfg.Name)
		}
		if err := startStatusServer(overlay.net, overlay.cfg, overlay.protocols); err != nil {
			return fmt.Errorf("start userspace netstack status server for overlay %q: %w", overlay.name, err)
		}
	}
	return nil
}

func (r *Runtime) Close() {
	for i := len(r.protocols) - 1; i >= 0; i-- {
		r.protocols[i].Close()
	}
	for _, overlayCfg := range r.cfg.Overlays {
		overlay := r.overlays[overlayCfg.Name]
		if overlay != nil && overlay.tun != nil {
			_ = overlay.tun.Close()
		}
	}
}
