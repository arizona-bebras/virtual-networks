package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
)

const (
	defaultListenPort = 51820
	defaultMTU        = 1420
	defaultPeerCount  = 3
	statusPort        = 8080
)

func main() {
	runtime, err := newRouterRuntime()
	if err != nil {
		log.Fatalf("create router runtime: %v", err)
	}
	defer runtime.close()

	if err := runtime.start(); err != nil {
		log.Fatalf("start router runtime: %v", err)
	}

	printBootstrapInfo(runtime.cfg, runtime.serverID, runtime.peers)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	<-ctx.Done()
	log.Println("shutting down userspace wireguard router")
}

func init() {
	log.SetFlags(log.LstdFlags | log.Lmicroseconds)
}
