package router

import (
	"fmt"
	"strings"
)

var protocolRegistry = map[string]TunnelProtocol{}

func RegisterProtocol(factory TunnelProtocol) {
	if factory == nil {
		panic("router: cannot register nil protocol")
	}
	name := normalizeProtocolName(factory.Name())
	if name == "" {
		panic("router: cannot register protocol with empty name")
	}
	if _, exists := protocolRegistry[name]; exists {
		panic(fmt.Sprintf("router: protocol %q already registered", name))
	}
	protocolRegistry[name] = factory
}

func selectTunnelProtocol(name string) (TunnelProtocol, error) {
	factory, ok := protocolRegistry[normalizeProtocolName(name)]
	if !ok {
		return nil, fmt.Errorf("unsupported protocol %q", name)
	}
	return factory, nil
}

func normalizeProtocolName(name string) string {
	return strings.ToLower(strings.TrimSpace(name))
}
