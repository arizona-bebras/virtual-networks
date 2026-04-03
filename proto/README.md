# Proto package

`proto` is a shared package that contains generated protobuf code for both TypeScript and Go so other workspace members can import it directly.

## Generated outputs

- TypeScript: `proto/gen/ts`
- Go: `proto/gen/go`

## Commands

```bash
pnpm --filter proto generate:ts
pnpm --filter proto generate:go
pnpm --filter proto generate
pnpm --filter proto clean
```

## Automation behavior (important)

- **pnpm**: not automatic by default unless you wire scripts. This package now has a `prepare` script (`generate`) so installs/build flows that run package lifecycle scripts will regenerate both TS and Go outputs.
- **go**: `go build` / `go test` do **not** run protobuf generation automatically. You must run generation explicitly (e.g. `pnpm --filter proto generate:go`) before building Go consumers.

## Consumption

- JS/TS packages in the workspace can depend on `proto` via `"proto": "workspace:*"`.
- Go modules can use:

```go
require proto v0.0.0
replace proto => ../proto
```

and import generated packages such as `proto/gen/go/helloworld`.
