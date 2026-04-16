FROM golang:1.25.5-alpine AS build

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/router .

FROM alpine:3.22

RUN apk add --no-cache ca-certificates iproute2

WORKDIR /app

COPY --from=build /out/router /usr/local/bin/router

ENTRYPOINT ["/usr/local/bin/router"]
