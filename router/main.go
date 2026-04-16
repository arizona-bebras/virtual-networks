package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
)

const (
	defaultMTU = 1420
	statusPort = 8080
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

	printBootstrapInfo(runtime.cfg, runtime.protocols)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	<-ctx.Done()
	log.Printf("shutting down userspace router with %d protocol instances", len(runtime.protocols))
}

func init() {
	log.SetFlags(log.LstdFlags | log.Lmicroseconds)
}
