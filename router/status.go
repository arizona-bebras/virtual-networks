package main

import (
	"fmt"
	"net"
	"net/http"
	"strings"
)

func startStatusServer(
	tnet *userspaceNetstack,
	cfg serverConfig,
	serverID wireGuardIdentity,
	peers []peer,
	observations *peerObservationLog,
) error {
	listener, err := tnet.ListenTCP(&net.TCPAddr{
		IP:   net.IP(cfg.ServerAddr.AsSlice()),
		Port: statusPort,
	})
	if err != nil {
		return err
	}

	go func() {
		_ = http.Serve(listener, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "text/plain; charset=utf-8")
			_, _ = w.Write([]byte(renderStatusBody(cfg, serverID, peers, observations, r.RemoteAddr)))
		}))
	}()

	return nil
}

func renderStatusBody(
	cfg serverConfig,
	serverID wireGuardIdentity,
	peers []peer,
	observations *peerObservationLog,
	requesterAddr string,
) string {
	var b strings.Builder
	fmt.Fprintf(&b, "userspace wireguard router\n")
	fmt.Fprintf(&b, "server_ip=%s\n", cfg.ServerAddr)
	fmt.Fprintf(&b, "listen_port=%d\n", cfg.ListenPort)
	fmt.Fprintf(&b, "overlay=%s\n", cfg.OverlayCIDR)
	fmt.Fprintf(&b, "server_public_key=%s\n", encodeBase64(serverID.Public[:]))
	for _, p := range peers {
		fmt.Fprintf(&b, "%s=%s", p.Name, p.Addr)
		if p.Addr.String() == strings.Split(requesterAddr, ":")[0] {
			fmt.Fprintf(&b, " (you)")
		}
		fmt.Fprintf(&b, "\n")
	}
	for _, obs := range observations.Snapshot() {
		fmt.Fprintf(
			&b,
			"observed endpoint=%s packets=%d last_type=%s backend=%s sender_idx=%d receiver_idx=%d\n",
			obs.Endpoint,
			obs.Packets,
			obs.LastPacketType,
			obs.LastBackend,
			obs.LastSenderIndex,
			obs.LastReceiverIndex,
		)
	}
	return b.String()
}

func printBootstrapInfo(cfg serverConfig, serverID wireGuardIdentity, peers []peer) {
	endpoint := fmt.Sprintf("%s:%d", cfg.PublicHost, cfg.ListenPort)

	fmt.Println("=== Userspace WireGuard Router ===")
	fmt.Printf("Server listen UDP endpoint: %s\n", endpoint)
	fmt.Printf("Server tunnel address: %s/%d\n", cfg.ServerAddr, cfg.OverlayCIDR.Bits())
	fmt.Printf("Server public key: %s\n", encodeBase64(serverID.Public[:]))
	fmt.Printf("Status endpoint inside tunnel: http://%s:%d/\n", cfg.ServerAddr, statusPort)
	fmt.Println()
	fmt.Println("Peer configs:")

	for _, p := range peers {
		fmt.Printf("\n# %s\n", p.Name)
		fmt.Println(renderPeerConfig(cfg, endpoint, serverID, p))
	}

	fmt.Println()
	if cfg.PublicHost == "127.0.0.1" {
		fmt.Println("Set WG_PUBLIC_HOST to your reachable server IP or DNS name before distributing these configs.")
	}
}
