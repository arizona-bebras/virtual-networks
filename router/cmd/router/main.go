package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	router "router"
	_ "router/internal/wireguard"
)

func main() {
	runtime, err := router.NewRuntime()
	if err != nil {
		log.Fatalf("create router runtime: %v", err)
	}
	defer runtime.Close()

	if err := runtime.Start(); err != nil {
		log.Fatalf("start router runtime: %v", err)
	}

	runtime.PrintBootstrapInfo()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	<-ctx.Done()
	log.Printf("shutting down userspace router")
}

func init() {
	log.SetFlags(log.LstdFlags | log.Lmicroseconds)
}
