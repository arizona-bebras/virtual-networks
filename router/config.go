package router

import (
	"fmt"
)

func validateConfig(cfg Config) error {
	if len(cfg.Overlays) == 0 {
		return fmt.Errorf("at least one overlay entry is required")
	}
	if len(cfg.Protocols) == 0 {
		return fmt.Errorf("at least one protocol entry is required")
	}

	seenOverlays := make(map[string]struct{}, len(cfg.Overlays))
	for _, overlay := range cfg.Overlays {
		if overlay.NetworkID == "" {
			return fmt.Errorf("network id is required")
		}
		if _, exists := seenOverlays[overlay.NetworkID]; exists {
			return fmt.Errorf("duplicate network id %q", overlay.NetworkID)
		}
		seenOverlays[overlay.NetworkID] = struct{}{}

		if !overlay.OverlayCIDR.Contains(overlay.ServerAddr) {
			return fmt.Errorf("server address %s is outside network %q overlay %s", overlay.ServerAddr, overlay.NetworkID, overlay.OverlayCIDR)
		}
		if overlay.OverlayCIDR.Bits() != 24 {
			return fmt.Errorf("network %q overlay %s currently supports /24 only", overlay.NetworkID, overlay.OverlayCIDR)
		}
		if overlay.MTU < 1280 {
			return fmt.Errorf("network %q MTU must be >= 1280", overlay.NetworkID)
		}
		if overlay.StatusPort < 1 || overlay.StatusPort > 65535 {
			return fmt.Errorf("network %q status port must be between 1 and 65535", overlay.NetworkID)
		}
	}

	seenNames := make(map[string]struct{}, len(cfg.Protocols))
	for _, protocol := range cfg.Protocols {
		if protocol.ID == "" {
			return fmt.Errorf("protocol id is required")
		}
		if _, exists := seenNames[protocol.ID]; exists {
			return fmt.Errorf("duplicate protocol id %q", protocol.ID)
		}
		seenNames[protocol.ID] = struct{}{}

		if protocol.NetworkID == "" {
			return fmt.Errorf("protocol %q must set network id", protocol.ID)
		}
		overlay, exists := overlayForNetworkID(cfg.Overlays, protocol.NetworkID)
		if !exists {
			return fmt.Errorf("protocol %q references unknown network %q", protocol.ID, protocol.NetworkID)
		}
		if protocol.ListenPort == 0 {
			return fmt.Errorf("protocol %q must set listen port", protocol.ID)
		}
		if protocol.PublicHost == "" {
			return fmt.Errorf("protocol %q must set public host", protocol.ID)
		}

		switch normalizeProtocolName(protocol.Name) {
		case "wireguard":
			if protocol.WireGuard == nil {
				return fmt.Errorf("protocol %q is missing wireguard settings", protocol.ID)
			}
			if protocol.WireGuard.InterfacePrivateKey == nil {
				return fmt.Errorf("protocol %q is missing wireguard interface private key", protocol.ID)
			}
			if protocol.WireGuard.InterfacePublicKey == nil {
				return fmt.Errorf("protocol %q is missing wireguard interface public key", protocol.ID)
			}
			if err := validateProtocolPeerIDs(protocol); err != nil {
				return err
			}
			if len(protocol.WireGuard.Peers) == 0 {
				return fmt.Errorf("protocol %q must include at least one wireguard peer", protocol.ID)
			}
			for _, peer := range protocol.WireGuard.Peers {
				if !overlay.OverlayCIDR.Contains(peer.Addr) {
					return fmt.Errorf("wireguard peer %q address %s is outside network %q overlay %s", peer.ID, peer.Addr, protocol.NetworkID, overlay.OverlayCIDR)
				}
				if peer.Addr == overlay.ServerAddr {
					return fmt.Errorf("wireguard peer %q cannot use network %q server address %s", peer.ID, protocol.NetworkID, peer.Addr)
				}
			}
		default:
			return fmt.Errorf("unsupported protocol %q", protocol.Name)
		}
	}

	return nil
}

func validateProtocolPeerIDs(protocol ProtocolConfig) error {
	if len(protocol.PeerIDs) == 0 {
		return nil
	}

	seenRequested := make(map[string]struct{}, len(protocol.PeerIDs))
	for _, peerID := range protocol.PeerIDs {
		if peerID == "" {
			return fmt.Errorf("protocol %q peer_ids must not include empty peer id", protocol.ID)
		}
		if _, exists := seenRequested[peerID]; exists {
			return fmt.Errorf("protocol %q peer_ids includes duplicate peer id %q", protocol.ID, peerID)
		}
		seenRequested[peerID] = struct{}{}
	}

	selectedPeers := make(map[string]struct{}, len(protocol.WireGuard.Peers))
	for _, peer := range protocol.WireGuard.Peers {
		selectedPeers[peer.ID] = struct{}{}
	}
	for peerID := range seenRequested {
		if _, exists := selectedPeers[peerID]; !exists {
			return fmt.Errorf("protocol %q peer_ids references unknown peer %q in network %q", protocol.ID, peerID, protocol.NetworkID)
		}
	}
	return nil
}

func overlayForNetworkID(overlays []OverlayConfig, networkID string) (OverlayConfig, bool) {
	for _, overlay := range overlays {
		if overlay.NetworkID == networkID {
			return overlay, true
		}
	}
	return OverlayConfig{}, false
}
