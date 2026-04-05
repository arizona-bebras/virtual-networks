# Router

This package runs a userspace WireGuard router backed by `wireguard-go` and the WireGuard `netstack` TUN implementation.

## What it does

- Starts a userspace WireGuard server on a UDP endpoint
- Creates a userspace network stack for the tunnel interface
- Generates a server keypair and a few sample peer keypairs at startup
- Prints peer configs that can connect to the server
- Exposes an in-tunnel HTTP status page on `http://<server-tunnel-ip>:8080/`
- Wraps the WireGuard bind with a custom frontend that logs packet metadata and endpoint observations

## Current frontend architecture

The router currently uses one backend WireGuard device and one backend netstack, but the socket layer is wrapped in a custom `frontendBind`.

That frontend:

- Owns the shared UDP listener abstraction used by the backend device
- Observes inbound WireGuard packet metadata
- Logs endpoint, packet type, sender index, and receiver index
- Leaves a clean seam for future backend selection and tenant routing

Today, all peers still flow into the same backend. The frontend is scaffolding for later separation by tenant or network.

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
