package main

import (
	"fmt"
	"net/netip"
	"os"
	"strconv"
	"strings"
)

func loadConfig() (serverConfig, error) {
	overlay, err := parsePrefixEnv("WG_OVERLAY_CIDR", "10.44.0.0/24")
	if err != nil {
		return serverConfig{}, err
	}
	serverAddr, err := parseAddrEnv("WG_SERVER_ADDR", "10.44.0.1")
	if err != nil {
		return serverConfig{}, err
	}
	if !overlay.Contains(serverAddr) {
		return serverConfig{}, fmt.Errorf("server address %s is outside overlay %s", serverAddr, overlay)
	}
	if overlay.Bits() != 24 {
		return serverConfig{}, fmt.Errorf("WG_OVERLAY_CIDR currently supports /24 overlays")
	}

	port, err := parseIntEnv("WG_LISTEN_PORT", defaultListenPort)
	if err != nil {
		return serverConfig{}, err
	}
	mtu, err := parseIntEnv("WG_MTU", defaultMTU)
	if err != nil {
		return serverConfig{}, err
	}
	peerCount, err := parseIntEnv("WG_PEER_COUNT", defaultPeerCount)
	if err != nil {
		return serverConfig{}, err
	}
	keepalive, err := parseIntEnv("WG_KEEPALIVE_SECONDS", 25)
	if err != nil {
		return serverConfig{}, err
	}
	if peerCount < 1 {
		return serverConfig{}, fmt.Errorf("WG_PEER_COUNT must be >= 1")
	}

	publicHost := strings.TrimSpace(os.Getenv("WG_PUBLIC_HOST"))
	if publicHost == "" {
		publicHost = "127.0.0.1"
	}

	return serverConfig{
		ListenPort:   uint16(port),
		MTU:          mtu,
		PeerCount:    peerCount,
		ServerAddr:   serverAddr,
		OverlayCIDR:  overlay,
		PublicHost:   publicHost,
		KeepaliveSec: keepalive,
	}, nil
}

func parseIntEnv(name string, fallback int) (int, error) {
	raw := strings.TrimSpace(os.Getenv(name))
	if raw == "" {
		return fallback, nil
	}
	value, err := strconv.Atoi(raw)
	if err != nil {
		return 0, fmt.Errorf("%s must be an integer: %w", name, err)
	}
	return value, nil
}

func parseAddrEnv(name string, fallback string) (netip.Addr, error) {
	raw := strings.TrimSpace(os.Getenv(name))
	if raw == "" {
		raw = fallback
	}
	addr, err := netip.ParseAddr(raw)
	if err != nil {
		return netip.Addr{}, fmt.Errorf("%s must be a valid IP address: %w", name, err)
	}
	if !addr.Is4() {
		return netip.Addr{}, fmt.Errorf("%s currently supports IPv4 only", name)
	}
	return addr, nil
}

func parsePrefixEnv(name string, fallback string) (netip.Prefix, error) {
	raw := strings.TrimSpace(os.Getenv(name))
	if raw == "" {
		raw = fallback
	}
	prefix, err := netip.ParsePrefix(raw)
	if err != nil {
		return netip.Prefix{}, fmt.Errorf("%s must be a valid CIDR: %w", name, err)
	}
	if !prefix.Addr().Is4() {
		return netip.Prefix{}, fmt.Errorf("%s currently supports IPv4 only", name)
	}
	return prefix.Masked(), nil
}
