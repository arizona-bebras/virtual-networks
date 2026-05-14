package router

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

const prometheusAddrEnv = "ROUTER_PROMETHEUS_ADDR"

type prometheusSnapshot struct {
	Revision           string
	NetworkIDs         []string
	NetworkCount       int
	ProtocolCount      int
	WireGuardPeerCount int
	Reports            []PeerConnectionReport
	CollectError       error
}

type networkMetrics struct {
	RxBytes        uint64
	TxBytes        uint64
	Peers          int
	ConnectedPeers int
}

type routerCollector struct {
	runtime *Runtime

	info                         *prometheus.Desc
	scrapeSuccess                *prometheus.Desc
	scrapeError                  *prometheus.Desc
	networks                     *prometheus.Desc
	protocolInstances            *prometheus.Desc
	wireGuardPeers               *prometheus.Desc
	wireGuardConnectedPeers      *prometheus.Desc
	wireGuardRxBytes             *prometheus.Desc
	wireGuardTxBytes             *prometheus.Desc
	wireGuardNetworkPeers        *prometheus.Desc
	wireGuardNetworkConnected    *prometheus.Desc
	wireGuardNetworkRxBytes      *prometheus.Desc
	wireGuardNetworkTxBytes      *prometheus.Desc
	wireGuardPeerConnected       *prometheus.Desc
	wireGuardPeerLatestHandshake *prometheus.Desc
	wireGuardPeerRxBytes         *prometheus.Desc
	wireGuardPeerTxBytes         *prometheus.Desc
	wireGuardPeerEndpointInfo    *prometheus.Desc
}

func newRouterCollector(runtime *Runtime) *routerCollector {
	return &routerCollector{
		runtime: runtime,

		info: prometheus.NewDesc(
			"router_info",
			"Router build and configuration information.",
			[]string{"revision"},
			nil,
		),
		scrapeSuccess: prometheus.NewDesc(
			"router_prometheus_scrape_success",
			"Whether router metrics were collected successfully for this scrape.",
			nil,
			nil,
		),
		scrapeError: prometheus.NewDesc(
			"router_prometheus_scrape_error",
			"Router metrics collection error for this scrape.",
			[]string{"message"},
			nil,
		),
		networks: prometheus.NewDesc(
			"router_networks",
			"Configured overlay networks.",
			nil,
			nil,
		),
		protocolInstances: prometheus.NewDesc(
			"router_protocol_instances",
			"Configured protocol instances.",
			nil,
			nil,
		),
		wireGuardPeers: prometheus.NewDesc(
			"router_wireguard_peers",
			"Configured WireGuard peers.",
			nil,
			nil,
		),
		wireGuardConnectedPeers: prometheus.NewDesc(
			"router_wireguard_connected_peers",
			"WireGuard peers with a recent handshake.",
			nil,
			nil,
		),
		wireGuardRxBytes: prometheus.NewDesc(
			"router_wireguard_rx_bytes_total",
			"Total WireGuard bytes received by the router.",
			nil,
			nil,
		),
		wireGuardTxBytes: prometheus.NewDesc(
			"router_wireguard_tx_bytes_total",
			"Total WireGuard bytes transmitted by the router.",
			nil,
			nil,
		),
		wireGuardNetworkPeers: prometheus.NewDesc(
			"router_wireguard_network_peers",
			"Configured WireGuard peers by network.",
			[]string{"network_id"},
			nil,
		),
		wireGuardNetworkConnected: prometheus.NewDesc(
			"router_wireguard_network_connected_peers",
			"WireGuard peers with a recent handshake by network.",
			[]string{"network_id"},
			nil,
		),
		wireGuardNetworkRxBytes: prometheus.NewDesc(
			"router_wireguard_network_rx_bytes_total",
			"WireGuard bytes received by the router by network.",
			[]string{"network_id"},
			nil,
		),
		wireGuardNetworkTxBytes: prometheus.NewDesc(
			"router_wireguard_network_tx_bytes_total",
			"WireGuard bytes transmitted by the router by network.",
			[]string{"network_id"},
			nil,
		),
		wireGuardPeerConnected: prometheus.NewDesc(
			"router_wireguard_peer_connected",
			"Whether the WireGuard peer has a recent handshake.",
			[]string{"network_id", "protocol_instance_id", "peer_id"},
			nil,
		),
		wireGuardPeerLatestHandshake: prometheus.NewDesc(
			"router_wireguard_peer_latest_handshake_timestamp_seconds",
			"Unix timestamp of the latest WireGuard peer handshake.",
			[]string{"network_id", "protocol_instance_id", "peer_id"},
			nil,
		),
		wireGuardPeerRxBytes: prometheus.NewDesc(
			"router_wireguard_peer_rx_bytes_total",
			"WireGuard bytes received by the router for a peer.",
			[]string{"network_id", "protocol_instance_id", "peer_id"},
			nil,
		),
		wireGuardPeerTxBytes: prometheus.NewDesc(
			"router_wireguard_peer_tx_bytes_total",
			"WireGuard bytes transmitted by the router for a peer.",
			[]string{"network_id", "protocol_instance_id", "peer_id"},
			nil,
		),
		wireGuardPeerEndpointInfo: prometheus.NewDesc(
			"router_wireguard_peer_endpoint_info",
			"Last observed WireGuard endpoint for a peer.",
			[]string{"network_id", "protocol_instance_id", "peer_id", "endpoint"},
			nil,
		),
	}
}

func startPrometheusExporter(ctx context.Context, runtime *Runtime) (func() error, error) {
	addr := prometheusExporterAddr()
	if addr == "" {
		return nil, nil
	}

	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return nil, fmt.Errorf("listen on Prometheus exporter address %q: %w", addr, err)
	}

	registry := prometheus.NewRegistry()
	if err := registry.Register(newRouterCollector(runtime)); err != nil {
		_ = listener.Close()
		return nil, fmt.Errorf("register router Prometheus collector: %w", err)
	}

	mux := http.NewServeMux()
	mux.Handle("/metrics", promhttp.HandlerFor(registry, promhttp.HandlerOpts{}))
	mux.HandleFunc("/", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		_, _ = w.Write([]byte("router Prometheus exporter\nmetrics_path=/metrics\n"))
	})

	server := &http.Server{Handler: mux}
	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = server.Shutdown(shutdownCtx)
	}()
	go func() {
		if err := server.Serve(listener); err != nil && err != http.ErrServerClosed {
			log.Printf("Prometheus exporter stopped: %v", err)
		}
	}()

	log.Printf("Prometheus exporter listening on %s", listener.Addr())
	return func() error {
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		return server.Shutdown(shutdownCtx)
	}, nil
}

func prometheusExporterAddr() string {
	raw := strings.TrimSpace(os.Getenv(prometheusAddrEnv))
	switch strings.ToLower(raw) {
	case "off", "false", "disabled", "none":
		return ""
	case "":
		return ":9090"
	default:
		return raw
	}
}

func (c *routerCollector) Describe(ch chan<- *prometheus.Desc) {
	ch <- c.info
	ch <- c.scrapeSuccess
	ch <- c.scrapeError
	ch <- c.networks
	ch <- c.protocolInstances
	ch <- c.wireGuardPeers
	ch <- c.wireGuardConnectedPeers
	ch <- c.wireGuardRxBytes
	ch <- c.wireGuardTxBytes
	ch <- c.wireGuardNetworkPeers
	ch <- c.wireGuardNetworkConnected
	ch <- c.wireGuardNetworkRxBytes
	ch <- c.wireGuardNetworkTxBytes
	ch <- c.wireGuardPeerConnected
	ch <- c.wireGuardPeerLatestHandshake
	ch <- c.wireGuardPeerRxBytes
	ch <- c.wireGuardPeerTxBytes
	ch <- c.wireGuardPeerEndpointInfo
}

func (c *routerCollector) Collect(ch chan<- prometheus.Metric) {
	snapshot := c.runtime.prometheusSnapshot()
	networkStats, globalRxBytes, globalTxBytes, globalConnectedPeers := aggregateWireGuardMetrics(snapshot)

	ch <- prometheus.MustNewConstMetric(c.info, prometheus.GaugeValue, 1, snapshot.Revision)
	if snapshot.CollectError != nil {
		ch <- prometheus.MustNewConstMetric(c.scrapeSuccess, prometheus.GaugeValue, 0)
		ch <- prometheus.MustNewConstMetric(c.scrapeError, prometheus.GaugeValue, 1, snapshot.CollectError.Error())
	} else {
		ch <- prometheus.MustNewConstMetric(c.scrapeSuccess, prometheus.GaugeValue, 1)
	}

	ch <- prometheus.MustNewConstMetric(c.networks, prometheus.GaugeValue, float64(snapshot.NetworkCount))
	ch <- prometheus.MustNewConstMetric(c.protocolInstances, prometheus.GaugeValue, float64(snapshot.ProtocolCount))
	ch <- prometheus.MustNewConstMetric(c.wireGuardPeers, prometheus.GaugeValue, float64(snapshot.WireGuardPeerCount))
	ch <- prometheus.MustNewConstMetric(c.wireGuardConnectedPeers, prometheus.GaugeValue, float64(globalConnectedPeers))
	ch <- prometheus.MustNewConstMetric(c.wireGuardRxBytes, prometheus.CounterValue, float64(globalRxBytes))
	ch <- prometheus.MustNewConstMetric(c.wireGuardTxBytes, prometheus.CounterValue, float64(globalTxBytes))

	for _, networkID := range sortedNetworkIDs(networkStats) {
		stats := networkStats[networkID]
		ch <- prometheus.MustNewConstMetric(c.wireGuardNetworkPeers, prometheus.GaugeValue, float64(stats.Peers), networkID)
		ch <- prometheus.MustNewConstMetric(c.wireGuardNetworkConnected, prometheus.GaugeValue, float64(stats.ConnectedPeers), networkID)
		ch <- prometheus.MustNewConstMetric(c.wireGuardNetworkRxBytes, prometheus.CounterValue, float64(stats.RxBytes), networkID)
		ch <- prometheus.MustNewConstMetric(c.wireGuardNetworkTxBytes, prometheus.CounterValue, float64(stats.TxBytes), networkID)
	}

	for _, report := range snapshot.Reports {
		latestHandshake := float64(0)
		if !report.LatestHandshakeAt.IsZero() {
			latestHandshake = float64(report.LatestHandshakeAt.Unix())
		}
		ch <- prometheus.MustNewConstMetric(c.wireGuardPeerConnected, prometheus.GaugeValue, boolFloat(report.Connected), report.NetworkID, report.ProtocolInstanceID, report.PeerID)
		ch <- prometheus.MustNewConstMetric(c.wireGuardPeerLatestHandshake, prometheus.GaugeValue, latestHandshake, report.NetworkID, report.ProtocolInstanceID, report.PeerID)
		ch <- prometheus.MustNewConstMetric(c.wireGuardPeerRxBytes, prometheus.CounterValue, float64(report.RxBytes), report.NetworkID, report.ProtocolInstanceID, report.PeerID)
		ch <- prometheus.MustNewConstMetric(c.wireGuardPeerTxBytes, prometheus.CounterValue, float64(report.TxBytes), report.NetworkID, report.ProtocolInstanceID, report.PeerID)
		ch <- prometheus.MustNewConstMetric(c.wireGuardPeerEndpointInfo, prometheus.GaugeValue, 1, report.NetworkID, report.ProtocolInstanceID, report.PeerID, report.Endpoint)
	}
}

func (r *Runtime) prometheusSnapshot() prometheusSnapshot {
	r.mu.Lock()
	defer r.mu.Unlock()

	snapshot := prometheusSnapshot{
		Revision:      r.revision,
		NetworkCount:  len(r.cfg.Overlays),
		ProtocolCount: len(r.protocols),
	}
	for _, overlay := range r.cfg.Overlays {
		snapshot.NetworkIDs = append(snapshot.NetworkIDs, overlay.NetworkID)
	}
	sort.Strings(snapshot.NetworkIDs)

	for _, protocol := range r.protocols {
		if normalizeProtocolName(protocol.Name()) != "wireguard" {
			continue
		}
		reporter, ok := protocol.(ConnectionReporter)
		if !ok {
			continue
		}
		reports, err := reporter.ConnectionReports()
		if err != nil {
			snapshot.CollectError = fmt.Errorf("%s: %w", protocol.ID(), err)
			return snapshot
		}
		snapshot.Reports = append(snapshot.Reports, reports...)
		snapshot.WireGuardPeerCount += len(reports)
	}

	sort.Slice(snapshot.Reports, func(a, b int) bool {
		left := snapshot.Reports[a]
		right := snapshot.Reports[b]
		return strings.Join([]string{left.NetworkID, left.ProtocolInstanceID, left.PeerID}, "\x00") <
			strings.Join([]string{right.NetworkID, right.ProtocolInstanceID, right.PeerID}, "\x00")
	})

	return snapshot
}

func aggregateWireGuardMetrics(snapshot prometheusSnapshot) (map[string]networkMetrics, uint64, uint64, int) {
	networkStats := map[string]networkMetrics{}
	var globalRxBytes uint64
	var globalTxBytes uint64
	var globalConnectedPeers int

	for _, report := range snapshot.Reports {
		stats := networkStats[report.NetworkID]
		stats.RxBytes += report.RxBytes
		stats.TxBytes += report.TxBytes
		stats.Peers++
		if report.Connected {
			stats.ConnectedPeers++
			globalConnectedPeers++
		}
		networkStats[report.NetworkID] = stats
		globalRxBytes += report.RxBytes
		globalTxBytes += report.TxBytes
	}
	for _, networkID := range snapshot.NetworkIDs {
		if _, exists := networkStats[networkID]; !exists {
			networkStats[networkID] = networkMetrics{}
		}
	}

	return networkStats, globalRxBytes, globalTxBytes, globalConnectedPeers
}

func sortedNetworkIDs(networkStats map[string]networkMetrics) []string {
	networkIDs := make([]string, 0, len(networkStats))
	for networkID := range networkStats {
		networkIDs = append(networkIDs, networkID)
	}
	sort.Strings(networkIDs)
	return networkIDs
}

func boolFloat(value bool) float64 {
	if value {
		return 1
	}
	return 0
}
