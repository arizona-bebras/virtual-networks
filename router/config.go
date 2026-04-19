package main

import (
	"fmt"
	"net/netip"
)

func loadConfig() (routerConfig, error) {
	cfg := routerConfig{
		Overlays: []namedOverlayConfig{
			{
				Name: "primary",
				Config: overlayConfig{
					MTU:         defaultMTU,
					ServerAddr:  netip.MustParseAddr("10.44.0.1"),
					OverlayCIDR: netip.MustParsePrefix("10.44.0.0/24"),
					StatusPort:  statusPort,
				},
			},
			{
				Name: "secondary",
				Config: overlayConfig{
					MTU:         defaultMTU,
					ServerAddr:  netip.MustParseAddr("10.44.0.1"),
					OverlayCIDR: netip.MustParsePrefix("10.44.0.0/24"),
					StatusPort:  statusPort,
				},
			},
		},
		Protocols: []protocolConfig{
			{
				Name:         "wireguard",
				InstanceName: "wg-primary",
				OverlayName:  "primary",
				ListenPort:   51820,
				PublicHost:   "127.0.0.1",
				WireGuard: &wireGuardProtocolConfig{
					PeerCount:    2,
					KeepaliveSec: 25,
				},
			},
			{
				Name:         "wireguard",
				InstanceName: "wg-secondary",
				OverlayName:  "secondary",
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
	if len(cfg.Overlays) == 0 {
		return fmt.Errorf("at least one overlay entry is required")
	}
	if len(cfg.Protocols) == 0 {
		return fmt.Errorf("at least one protocol entry is required")
	}

	seenOverlays := make(map[string]struct{}, len(cfg.Overlays))
	for _, overlay := range cfg.Overlays {
		if overlay.Name == "" {
			return fmt.Errorf("overlay name is required")
		}
		if _, exists := seenOverlays[overlay.Name]; exists {
			return fmt.Errorf("duplicate overlay name %q", overlay.Name)
		}
		seenOverlays[overlay.Name] = struct{}{}

		if !overlay.Config.OverlayCIDR.Contains(overlay.Config.ServerAddr) {
			return fmt.Errorf("server address %s is outside overlay %s", overlay.Config.ServerAddr, overlay.Config.OverlayCIDR)
		}
		if overlay.Config.OverlayCIDR.Bits() != 24 {
			return fmt.Errorf("overlay %q currently supports /24 only", overlay.Name)
		}
		if overlay.Config.MTU < 1280 {
			return fmt.Errorf("overlay %q MTU must be >= 1280", overlay.Name)
		}
		if overlay.Config.StatusPort < 1 || overlay.Config.StatusPort > 65535 {
			return fmt.Errorf("overlay %q status port must be between 1 and 65535", overlay.Name)
		}
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

		if protocol.OverlayName == "" {
			return fmt.Errorf("protocol %q must set overlay name", protocol.InstanceName)
		}
		if _, exists := seenOverlays[protocol.OverlayName]; !exists {
			return fmt.Errorf("protocol %q references unknown overlay %q", protocol.InstanceName, protocol.OverlayName)
		}
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
