# AGENTS.md

## Stack

- `frontend/`: SvelteKit 2, Svelte 5, Tailwind CSS 4, Bits UI, TanStack Table, Biome
- `backend/`: NestJS 11, Drizzle ORM, PostgreSQL driver, Jest, Biome
- `common/`: shared TypeScript DTO package built with `tsc` and consumed through package exports
- `proto/`: shared protobuf schema and generated TypeScript/Go code
- `router/`: Go userspace WireGuard router

## Tools

- Package manager: `pnpm` workspaces
- Formatter/linter: Biome
- Frontend build/tooling: Vite, `svelte-check`
- Backend build/tooling: Nest CLI, TypeScript
- Go validation: `go vet`, `go build`

### Using

Always run `pnpm check`, `pnpm lint`, `pnpm format` and fix all issues after implementing a task in `backend` and `frontend`. Run `go vet` for Go code.

## Monorepo Structure

- `frontend/`, `backend/`, `common/`, and `proto/` are `pnpm` workspace packages
- `router/` is a separate Go module, not a `pnpm` workspace package
- `frontend/src/routes`: route tree
- `frontend/src/lib`: reusable app code and UI components
- `backend/src/modules`: Nest feature modules
- `backend/src/db`: database connection and schema
- `common/src`: shared DTO source files
- `common/dist`: built package output used by `common` package exports
- `proto/gen/ts`: generated TypeScript protobuf output
- `proto/gen/go`: generated Go protobuf output

## CI

CI runs only for changed areas.

- Frontend job: Biome check, `svelte-check`, frontend build
- Backend job: Biome check, backend build
- Proto job: regenerate protobuf artifacts, `go vet`, `go build`
- Router job: `go vet`, `go build`

Important repo behavior:

- Changes under `proto/` can trigger frontend, backend, proto, and router CI work
- CI pins `protoc` to `25.2` for protobuf generation
