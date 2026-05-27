FROM golang:1.25.5-alpine AS build

WORKDIR /src/router

COPY router/go.mod router/go.sum ./
COPY proto/go.mod proto/go.sum ../proto/
RUN go mod download

COPY router ./
COPY proto ../proto
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/router ./cmd/router

FROM alpine:3.22

RUN apk add --no-cache ca-certificates iproute2

WORKDIR /app

COPY --from=build /out/router /usr/local/bin/router

ENTRYPOINT ["/usr/local/bin/router"]
