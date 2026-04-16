package main

import (
	"fmt"
	"net/netip"
)

func loadConfig() (routerConfig, error) {
	cfg := routerConfig{
		Overlay: overlayConfig{
			MTU:         defaultMTU,
			ServerAddr:  netip.MustParseAddr("10.44.0.1"),
			OverlayCIDR: netip.MustParsePrefix("10.44.0.0/24"),
			StatusPort:  statusPort,
		},
		Protocols: []protocolConfig{
			{
				Name:         "wireguard",
				InstanceName: "wg-primary",
				ListenPort:   51820,
				PublicHost:   "127.0.0.1",
				WireGuard: &wireGuardProtocolConfig{
					PeerCount:    2,
					KeepaliveSec: 25,
				},
			},
		},
	}

	if err := validateConfig(cfg); err != nil {
		return routerConfig{}, err
	}

	return cfg, nil
}

func validateConfig(cfg routerConfig) error {
	if !cfg.Overlay.OverlayCIDR.Contains(cfg.Overlay.ServerAddr) {
		return fmt.Errorf("server address %s is outside overlay %s", cfg.Overlay.ServerAddr, cfg.Overlay.OverlayCIDR)
	}
	if cfg.Overlay.OverlayCIDR.Bits() != 24 {
		return fmt.Errorf("overlay currently supports /24 only")
	}
	if cfg.Overlay.MTU < 1280 {
		return fmt.Errorf("overlay MTU must be >= 1280")
	}
	if cfg.Overlay.StatusPort < 1 || cfg.Overlay.StatusPort > 65535 {
		return fmt.Errorf("status port must be between 1 and 65535")
	}
	if len(cfg.Protocols) == 0 {
		return fmt.Errorf("at least one protocol entry is required")
	}

	seenNames := make(map[string]struct{}, len(cfg.Protocols))
	for _, protocol := range cfg.Protocols {
		if protocol.InstanceName == "" {
			return fmt.Errorf("protocol instance name is required")
		}
		if _, exists := seenNames[protocol.InstanceName]; exists {
			return fmt.Errorf("duplicate protocol instance name %q", protocol.InstanceName)
		}
		seenNames[protocol.InstanceName] = struct{}{}

		if protocol.ListenPort == 0 {
			return fmt.Errorf("protocol %q must set listen port", protocol.InstanceName)
		}
		if protocol.PublicHost == "" {
			return fmt.Errorf("protocol %q must set public host", protocol.InstanceName)
		}

		switch normalizeProtocolName(protocol.Name) {
		case "wireguard":
			if protocol.WireGuard == nil {
				return fmt.Errorf("protocol %q is missing wireguard settings", protocol.InstanceName)
			}
			if protocol.WireGuard.PeerCount < 1 {
				return fmt.Errorf("protocol %q must allocate at least one wireguard peer", protocol.InstanceName)
			}
		default:
			return fmt.Errorf("unsupported protocol %q", protocol.Name)
		}
	}

	return nil
}
