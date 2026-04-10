# Router

This package runs a userspace WireGuard router built on `wireguard-go` with a local gVisor-backed netstack constructor.

## What it does

- Starts a userspace WireGuard server on a UDP endpoint
- Creates a userspace TUN and netstack entirely in-process
- Keeps direct access to the underlying gVisor `*stack.Stack` for future packet filtering or firewall work
- Generates a server keypair and a few sample peer keypairs at startup
- Prints peer configs that can connect to the server
- Exposes an in-tunnel HTTP status page on `http://<server-tunnel-ip>:8080/`
- Wraps the WireGuard bind with a custom frontend that logs packet metadata and endpoint observations

## Architecture

The current implementation has three main layers:

1. Frontend UDP/WireGuard bind
   - Owns the shared UDP listener abstraction used by the backend WireGuard device
   - Observes inbound WireGuard packet metadata
   - Logs endpoint, packet type, sender index, and receiver index
   - Leaves a clean seam for future backend selection and tenant routing

2. Backend WireGuard device
   - Runs a single `wireguard-go` device today
   - Accepts generated peers and their tunnel IP assignments
   - Routes all peers into one backend overlay for now

3. Local userspace netstack
   - Uses a package-local constructor instead of the stock WireGuard `netstack.CreateNetTUN`
   - Preserves access to the gVisor stack object for future firewall or routing policy features
   - Serves the in-tunnel status endpoint

Today, all peers still flow into the same backend device and netstack. The frontend is scaffolding for later separation by tenant or network.

## File layout

- `main.go` - process bootstrap and shutdown
- `types.go` - shared structs and interfaces
- `runtime.go` - runtime construction, startup, and cleanup
- `frontend.go` - custom bind wrapper, packet parsing, and observation logging
- `config.go` - environment/config parsing
- `wireguard.go` - key generation and WireGuard config rendering
- `status.go` - in-tunnel HTTP status server and bootstrap output
- `userspace_netstack.go` - local gVisor-backed netstack/TUN constructor

## Running

From the `router/` directory:

```powershell
go run .
```

Or build it:

```powershell
go build .
```

## Environment variables

- `WG_PUBLIC_HOST` - public IP or DNS name advertised in generated peer configs. Default: `127.0.0.1`
- `WG_LISTEN_PORT` - UDP listen port. Default: `51820`
- `WG_SERVER_ADDR` - tunnel IP assigned to the server. Default: `10.44.0.1`
- `WG_OVERLAY_CIDR` - overlay network CIDR. Currently `/24` only. Default: `10.44.0.0/24`
- `WG_PEER_COUNT` - number of generated sample peers. Default: `3`
- `WG_MTU` - TUN MTU. Default: `1420`
- `WG_KEEPALIVE_SECONDS` - peer keepalive interval in generated configs. Default: `25`

## Notes

- The generated keys are ephemeral and change on each process start.
- The current implementation focuses on userspace routing and frontend observability rather than persistent peer management.
- The status page includes observed endpoint and packet identifier information captured by the custom frontend.
- The package is structured so future work can add tenant-aware backend selection and gVisor firewall rules without rebuilding the entire router shape.
