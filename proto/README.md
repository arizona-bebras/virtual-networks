# Proto package

`proto` is a shared package that contains the control-plane protobuf contract and generated code for both TypeScript and Go so other workspace members can import it directly.

## Generated outputs

- TypeScript: `proto/gen/ts`
- Go: `proto/gen/go`

## Contract

- `GetRouterConfiguration`: startup fetch for the router's desired networks, protocol instances, and peers.
- `WatchRouterConfiguration`: server stream of full configuration snapshots with revision and change hints.
- `ReportRouterEvents`: client stream used by routers to report WireGuard handshake and connection activity.

## Commands

```bash
pnpm --filter proto generate:ts
pnpm --filter proto generate:go
pnpm --filter proto generate
pnpm --filter proto clean
```

## Automation behavior (important)

- **pnpm**: this package has a `prepare` script that regenerates the TypeScript output during installs/build flows that run package lifecycle scripts.
- **go**: `go build` / `go test` do **not** run protobuf generation automatically. You must run generation explicitly (e.g. `pnpm --filter proto generate:go`) before building Go consumers.
- **protoc version**: CI pins `protoc` to `25.2` so local Go regeneration should use the same release to avoid generated-file diffs such as the stamped `protoc` version line.

## Consumption

- JS/TS packages in the workspace can depend on `proto` via `"proto": "workspace:*"`.
- Go modules can use:

```go
require proto v0.0.0
replace proto => ../proto
```

and import generated packages such as `proto/gen/go/controlplane`.
