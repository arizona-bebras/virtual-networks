package router

import (
	"fmt"
	"net"
	"net/http"
	"router/internal/netstack"
	"strings"
)

func startStatusServer(
	tnet *netstack.Network,
	cfg OverlayConfig,
	protocols []ProtocolInstance,
) error {
	listener, err := tnet.ListenTCP(&net.TCPAddr{
		IP:   net.IP(cfg.ServerAddr.AsSlice()),
		Port: cfg.StatusPort,
	})
	if err != nil {
		return err
	}

	go func() {
		_ = http.Serve(listener, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "text/plain; charset=utf-8")
			_, _ = w.Write([]byte(renderStatusBody(cfg, protocols, r.RemoteAddr)))
		}))
	}()

	return nil
}

func renderStatusBody(
	cfg OverlayConfig,
	protocols []ProtocolInstance,
	requesterAddr string,
) string {
	var b strings.Builder

	fmt.Fprintf(&b, "userspace router\n")
	fmt.Fprintf(&b, "server_ip=%s\n", cfg.ServerAddr)
	fmt.Fprintf(&b, "overlay=%s\n", cfg.OverlayCIDR)

	for _, protocol := range protocols {
		info := protocol.StatusInfo(requesterAddr)
		fmt.Fprintf(&b, "\n[%s]\n", protocol.InstanceName())
		fmt.Fprintf(&b, "protocol=%s\n", protocol.Name())
		for _, line := range info.Lines {
			fmt.Fprintf(&b, "%s\n", line)
		}
	}

	return b.String()
}

func (r *Runtime) PrintBootstrapInfo() {
	printBootstrapInfo(r.cfg, r.protocols)
}

func printBootstrapInfo(cfg Config, protocols []ProtocolInstance) {
	fmt.Println("=== Userspace Router ===")

	for _, overlay := range cfg.Overlays {
		fmt.Printf(
			"Overlay [%s]: %s/%d\n",
			overlay.Name,
			overlay.Config.ServerAddr,
			overlay.Config.OverlayCIDR.Bits(),
		)
		fmt.Printf(
			"Status endpoint inside tunnel [%s]: http://%s:%d/\n",
			overlay.Name,
			overlay.Config.ServerAddr,
			overlay.Config.StatusPort,
		)
	}

	for _, protocol := range protocols {
		info := protocol.BootstrapInfo()
		fmt.Println()
		fmt.Printf("[%s]\n", protocol.InstanceName())
		fmt.Printf("Overlay: %s\n", protocol.OverlayName())
		fmt.Printf("Display: %s\n", info.DisplayName)
		fmt.Printf("Protocol: %s\n", protocol.Name())
		fmt.Printf("Listen endpoint: %s\n", info.ListenEndpoint)
		for _, line := range info.ServerDetails {
			fmt.Println(line)
		}

		if len(info.ClientProfiles) > 0 {
			fmt.Println()
			fmt.Println("Client configs:")
			for _, profile := range info.ClientProfiles {
				fmt.Printf("\n# %s\n", profile.Name)
				fmt.Println(profile.Config)
			}
		}

		if info.Postscript != "" {
			fmt.Println()
			fmt.Println(info.Postscript)
		}
	}
}
