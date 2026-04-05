package main

import (
	"fmt"
	"net/netip"

	"golang.zx2c4.com/wireguard/conn"
	"golang.zx2c4.com/wireguard/device"
)

func newRouterRuntime() (*routerRuntime, error) {
	cfg, err := loadConfig()
	if err != nil {
		return nil, fmt.Errorf("load config: %w", err)
	}

	serverID, err := generateIdentity()
	if err != nil {
		return nil, fmt.Errorf("generate server identity: %w", err)
	}

	peers, err := generatePeers(cfg)
	if err != nil {
		return nil, fmt.Errorf("generate peers: %w", err)
	}

	tun, tnet, err := createUserspaceNetstack([]netip.Addr{cfg.ServerAddr}, nil, cfg.MTU)
	if err != nil {
		return nil, fmt.Errorf("create userspace netstack TUN: %w", err)
	}

	frontend := &frontendBind{
		inner: conn.NewDefaultBind(),
		logger: &peerObservationLog{
			byEndpoint:   make(map[string]*peerObservation),
			bySenderIdx:  make(map[uint32]string),
			byReceiverIx: make(map[uint32]string),
		},
		selector: singleBackendSelector{backendName: "default"},
	}

	logger := device.NewLogger(device.LogLevelVerbose, "userspace-wg: ")
	wgDevice := device.NewDevice(tun, frontend, logger)

	return &routerRuntime{
		cfg:      cfg,
		serverID: serverID,
		peers:    peers,
		frontend: frontend,
		backend: &backendInstance{
			name:   "default",
			device: wgDevice,
			tun:    tun,
			net:    tnet,
		},
	}, nil
}

func (r *routerRuntime) start() error {
	if err := r.backend.device.IpcSet(renderServerIPC(r.cfg, r.serverID, r.peers)); err != nil {
		return fmt.Errorf("configure wireguard device: %w", err)
	}
	if err := r.backend.device.Up(); err != nil {
		return fmt.Errorf("bring wireguard device up: %w", err)
	}
	if err := startStatusServer(r.backend.net, r.cfg, r.serverID, r.peers, r.frontend.logger); err != nil {
		return fmt.Errorf("start userspace netstack status server: %w", err)
	}
	return nil
}

func (r *routerRuntime) close() {
	if r.backend != nil && r.backend.device != nil {
		r.backend.device.Close()
	}
	if r.frontend != nil {
		_ = r.frontend.Close()
	}
}
