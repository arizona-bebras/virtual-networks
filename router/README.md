# Router

This package runs a userspace router built on a local gVisor-backed netstack with
multiple configurable ingress servers. WireGuard is the implemented ingress protocol today.

## What it does

- Creates a userspace TUN and netstack entirely in-process
- Starts multiple WireGuard ingress servers on independent UDP ports
- Allocates client IPs from the shared overlay subnet
- Prints client configs that can connect to each ingress server
- Exposes an in-tunnel HTTP status page on `http://<server-tunnel-ip>:8080/`
- Wraps each WireGuard bind with a frontend that logs packet metadata and endpoint observations

## Architecture

The current implementation has three main layers:

1. Overlay runtime
   - Owns the shared gVisor netstack and userspace packet plane
   - Allocates client addresses from the overlay subnet
   - Starts common status and lifecycle management

2. Protocol instances
   - Each configured ingress server is built as a protocol instance
   - Multiple WireGuard instances can run at the same time against the same overlay
   - The protocol abstraction leaves room for future ingress types without coupling them to the runtime

3. WireGuard frontend/backend
   - Wraps the UDP bind used by each `wireguard-go` device
   - Observes inbound WireGuard packet metadata
   - Logs endpoint, packet type, sender index, and receiver index

## File layout

- `main.go` - process bootstrap and shutdown
- `types.go` - shared structs and interfaces
- `runtime.go` - runtime construction, startup, and cleanup
- `config.go` - hardcoded router and ingress configuration
- `protocol.go` - protocol registry and selection
- `wireguard_protocol.go` - WireGuard identities, config rendering, frontend bind, and instance startup
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

## Configuration

Configuration is currently hardcoded in `config.go`:

- overlay subnet and server address
- userspace MTU
- status port
- multiple ingress server definitions

## Notes

- The generated WireGuard keys are ephemeral and change on each process start.
- The current implementation focuses on userspace routing and frontend observability rather than persistent peer management.
- The status page includes observed endpoint and packet identifier information captured by the WireGuard frontend.
