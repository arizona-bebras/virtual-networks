# AGENTS.md

## Stack

- `frontend/`: SvelteKit 2, Svelte 5, Tailwind CSS 4, Bits UI, TanStack Table, Biome
- `backend/`: NestJS 11, Drizzle ORM, PostgreSQL driver, Jest, Biome
- `common/`: shared TypeScript DTO package built with `tsc` and consumed through package exports
- `proto/`: shared protobuf schema and generated TypeScript/Go code
- `router/`: Go userspace WireGuard router

## Tools

- Package manager: `pnpm` monorepo workspace
- Task runner/cache: Turborepo via root `package.json` scripts
- Formatter/linter: Biome
- GitHub Actions linting: `actionlint`
- GitHub Actions formatting: Prettier through `pnpm format:actions`
- Frontend build/tooling: Vite, `svelte-check`
- Backend build/tooling: Nest CLI, Drizzle Kit, TypeScript
- Go validation: `go vet`, `go build`, `gofmt`

### Using

#### For Go modules (`router`, `proto`)

- Format changed Go files with `gofmt`.
- Run `go vet ./...` and `go build ./...` from the changed Go module (`router/` or `proto/`).
- For protobuf generation changes, prefer root Turbo commands such as `pnpm generate`, `pnpm generate:go`, or `pnpm generate:ts`.

#### For TypeScript packages (`backend`, `frontend`, `common`)

- Prefer root Turborepo scripts:
  - `pnpm check` for Biome checks and frontend type-checking.
  - `pnpm lint` for lint-only validation, including GitHub Actions via `actionlint`.
  - `pnpm format` for formatting TypeScript/Svelte packages and GitHub Actions YAML.
  - `pnpm build` for workspace builds.
  - `pnpm test` for backend tests.
- For focused runs, use Turbo task selectors, for example `pnpm exec turbo run frontend#type-check`, `pnpm exec turbo run backend#build`, or `pnpm exec turbo run common#build`.
- When implementing or changing backend features, update the backend e2e tests under `backend/test` to cover the new or changed behavior.

#### For `common`

If anything in `common` was modified, always run `pnpm exec turbo run common#build` or `pnpm build` so `common/dist` is refreshed.

#### For GitHub Actions

- Local composite actions live under `.github/actions/`.
- CI workflows are split by area under `.github/workflows/ci-*.yml`.
- Run `pnpm lint:actions` after editing workflows or actions.
- Run `pnpm format:actions` after editing workflows or actions.

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

- Common workflow: Biome check, common build
- Frontend workflow: Biome check, common build for type-check dependencies, `svelte-check`, frontend build
- Backend workflow: Biome check, backend build, backend e2e tests
- Proto workflow: regenerate protobuf artifacts, `go vet`, `go build`
- Router workflow: generate Go protobuf artifacts, `go vet`, `go build`
- GitHub Actions are validated with `actionlint` through `pnpm lint:actions`

Important repo behavior:

- Changes under `proto/` can trigger frontend, backend, proto, and router CI work
- CI pins `protoc` to `25.2` for protobuf generation
- Common GitHub Actions setup is shared through local composite actions for pnpm, protoc, Go, Turbo cache, and Biome reviewdog reporting
