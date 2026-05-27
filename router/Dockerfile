FROM node:22-alpine AS proto-build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk add --no-cache go protobuf-dev
RUN corepack enable

WORKDIR /app

COPY pnpm-workspace.yaml .npmrc ./
COPY pnpm-lock*.yaml ./
COPY package.json package.json
COPY proto/package.json proto/package.json

RUN pnpm install --filter proto --frozen-lockfile --ignore-scripts

COPY proto/go.mod proto/go.sum proto/
COPY proto/scripts proto/scripts
COPY proto/src proto/src

RUN pnpm --filter proto generate:go

FROM golang:1.25.5-alpine AS build

WORKDIR /src/router

COPY router/go.mod router/go.sum ./
COPY --from=proto-build /app/proto/go.mod /app/proto/go.sum ../proto/
RUN go mod download

COPY router ./
COPY --from=proto-build /app/proto ../proto
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/router ./cmd/router

FROM alpine:3.22

RUN apk add --no-cache ca-certificates iproute2

WORKDIR /app

COPY --from=build /out/router /usr/local/bin/router

ENTRYPOINT ["/usr/local/bin/router"]
