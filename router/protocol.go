package main

import (
	"fmt"
	"strings"
)

func selectTunnelProtocol(name string) (tunnelProtocol, error) {
	switch normalizeProtocolName(name) {
	case "wireguard":
		return wireGuardProtocol{}, nil
	default:
		return nil, fmt.Errorf("unsupported protocol %q", name)
	}
}

func normalizeProtocolName(name string) string {
	return strings.ToLower(strings.TrimSpace(name))
}
