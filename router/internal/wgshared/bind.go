package wgshared

import (
	"errors"
	"fmt"
	"log"
	"net"
	"strings"
	"sync"
	"sync/atomic"

	"golang.zx2c4.com/wireguard/conn"
	"golang.zx2c4.com/wireguard/device"
)

const minInboundQueueCapacity = 8192

type Endpoint struct {
	mu                  sync.Mutex
	port                uint16
	inner               conn.Bind
	logger              *observerLog
	receivers           map[*sharedBind]struct{}
	receiverByIndex     map[uint32]*sharedBind
	dispatchers         []conn.ReceiveFunc
	dispatcherCompleted sync.WaitGroup
}

type sharedBind struct {
	parent      *Endpoint
	backendName string

	mu        sync.RWMutex
	queues    []chan inboundPacket
	opened    bool
	batchSize int

	droppedInbound atomic.Uint64
}

type inboundPacket struct {
	data []byte
	ep   conn.Endpoint
}

func Key(protocolName string, port uint16) string {
	return fmt.Sprintf("%s|%d", strings.ToLower(strings.TrimSpace(protocolName)), port)
}

func NewEndpoint(port uint16) *Endpoint {
	return &Endpoint{
		port:            port,
		inner:           conn.NewDefaultBind(),
		logger:          newObserverLog(),
		receivers:       make(map[*sharedBind]struct{}),
		receiverByIndex: make(map[uint32]*sharedBind),
	}
}

func (e *Endpoint) NewBind(backendName string) conn.Bind {
	return &sharedBind{parent: e, backendName: backendName}
}

func (e *Endpoint) SnapshotForBackend(backend string) []Observation {
	return e.logger.SnapshotForBackend(backend)
}

func (e *Endpoint) DroppedInboundPackets(backend string) uint64 {
	e.mu.Lock()
	defer e.mu.Unlock()

	var dropped uint64
	for receiver := range e.receivers {
		if backend != "" && receiver.backendName != backend {
			continue
		}
		dropped += receiver.DroppedInboundPackets()
	}
	return dropped
}

func (e *Endpoint) ensureListeningLocked(port uint16) (uint16, error) {
	if len(e.dispatchers) > 0 {
		return e.port, nil
	}
	if port != 0 && port != e.port {
		return 0, fmt.Errorf("wireguard bind requested port %d but shared endpoint uses %d", port, e.port)
	}

	dispatchers, actualPort, err := e.inner.Open(e.port)
	if err != nil {
		return 0, err
	}
	e.port = actualPort
	e.dispatchers = dispatchers
	for idx, receiveFn := range dispatchers {
		e.dispatcherCompleted.Add(1)
		go e.runDispatcher(idx, receiveFn)
	}
	return actualPort, nil
}

func (e *Endpoint) runDispatcher(queueIdx int, receiveFn conn.ReceiveFunc) {
	defer e.dispatcherCompleted.Done()

	maxBatchSize := e.inner.BatchSize()
	if maxBatchSize < 1 {
		maxBatchSize = 1
	}

	buffers := make([][]byte, maxBatchSize)
	for i := range buffers {
		buffers[i] = make([]byte, device.MaxMessageSize)
	}
	sizes := make([]int, maxBatchSize)
	endpoints := make([]conn.Endpoint, maxBatchSize)

	for {
		n, err := receiveFn(buffers, sizes, endpoints)
		if err != nil {
			if errors.Is(err, net.ErrClosed) {
				return
			}
			if netErr, ok := err.(net.Error); ok && !netErr.Temporary() {
				return
			}
			log.Printf("shared wireguard dispatcher[%d]: receive error: %v", queueIdx, err)
			continue
		}

		for i := 0; i < n; i++ {
			if sizes[i] <= 0 || sizes[i] > len(buffers[i]) || endpoints[i] == nil {
				continue
			}
			packet := append([]byte(nil), buffers[i][:sizes[i]]...)
			meta := parsePacketMetadata(packet)
			e.dispatchInbound(queueIdx, packet, endpoints[i], meta)
		}
	}
}

func (e *Endpoint) dispatchInbound(queueIdx int, packet []byte, ep conn.Endpoint, meta packetMetadata) {
	targets, backendLabel := e.selectReceivers(meta)
	e.logger.record(ep, backendLabel, meta)
	for _, target := range targets {
		target.enqueue(queueIdx, inboundPacket{data: packet, ep: ep})
	}
}

func (e *Endpoint) selectReceivers(meta packetMetadata) ([]*sharedBind, string) {
	e.mu.Lock()
	defer e.mu.Unlock()

	if meta.ReceiverIndex != 0 {
		if target := e.receiverByIndex[meta.ReceiverIndex]; target != nil && target.isOpen() {
			return []*sharedBind{target}, target.backendName
		}
	}

	targets := make([]*sharedBind, 0, len(e.receivers))
	names := make([]string, 0, len(e.receivers))
	for target := range e.receivers {
		if !target.isOpen() {
			continue
		}
		targets = append(targets, target)
		names = append(names, target.backendName)
	}
	return targets, strings.Join(names, ",")
}

func (e *Endpoint) trackOutbound(sender *sharedBind, bufs [][]byte) {
	e.mu.Lock()
	defer e.mu.Unlock()
	for _, packet := range bufs {
		meta := parsePacketMetadata(packet)
		if meta.SenderIndex != 0 {
			e.receiverByIndex[meta.SenderIndex] = sender
		}
	}
}

func (b *sharedBind) Open(port uint16) ([]conn.ReceiveFunc, uint16, error) {
	b.mu.Lock()
	defer b.mu.Unlock()
	if b.opened {
		return nil, 0, conn.ErrBindAlreadyOpen
	}

	b.parent.mu.Lock()
	actualPort, err := b.parent.ensureListeningLocked(port)
	if err == nil {
		b.parent.receivers[b] = struct{}{}
	}
	queueCount := len(b.parent.dispatchers)
	b.batchSize = b.parent.inner.BatchSize()
	b.parent.mu.Unlock()
	if err != nil {
		return nil, 0, err
	}
	if queueCount == 0 {
		queueCount = 1
	}
	if b.batchSize < 1 {
		b.batchSize = 1
	}

	b.queues = make([]chan inboundPacket, queueCount)
	for i := range b.queues {
		b.queues[i] = make(chan inboundPacket, inboundQueueCapacity(b.batchSize))
	}
	b.opened = true

	receiveFns := make([]conn.ReceiveFunc, 0, len(b.queues))
	for idx := range b.queues {
		receiveFns = append(receiveFns, b.makeReceiveFunc(idx))
	}
	return receiveFns, actualPort, nil
}

func (b *sharedBind) makeReceiveFunc(queueIdx int) conn.ReceiveFunc {
	return func(packets [][]byte, sizes []int, eps []conn.Endpoint) (int, error) {
		b.mu.RLock()
		if !b.opened || queueIdx >= len(b.queues) {
			b.mu.RUnlock()
			return 0, net.ErrClosed
		}
		queue := b.queues[queueIdx]
		b.mu.RUnlock()

		first, ok := <-queue
		if !ok {
			return 0, net.ErrClosed
		}

		n := 0
		deliver := func(pkt inboundPacket) {
			copy(packets[n], pkt.data)
			sizes[n] = len(pkt.data)
			eps[n] = pkt.ep
			n++
		}
		deliver(first)
		for n < len(packets) {
			select {
			case pkt, ok := <-queue:
				if !ok {
					return n, nil
				}
				deliver(pkt)
			default:
				return n, nil
			}
		}
		return n, nil
	}
}

func (b *sharedBind) Close() error {
	b.mu.Lock()
	if !b.opened {
		b.mu.Unlock()
		return nil
	}
	b.opened = false
	queues := b.queues
	b.queues = nil
	b.mu.Unlock()

	b.parent.mu.Lock()
	delete(b.parent.receivers, b)
	for idx, owner := range b.parent.receiverByIndex {
		if owner == b {
			delete(b.parent.receiverByIndex, idx)
		}
	}
	lastReceiver := len(b.parent.receivers) == 0
	b.parent.mu.Unlock()

	for _, queue := range queues {
		close(queue)
	}
	if lastReceiver {
		if err := b.parent.inner.Close(); err != nil {
			return err
		}
		b.parent.dispatcherCompleted.Wait()
		b.parent.mu.Lock()
		b.parent.dispatchers = nil
		b.parent.receiverByIndex = make(map[uint32]*sharedBind)
		b.parent.mu.Unlock()
	}
	return nil
}

func (b *sharedBind) SetMark(mark uint32) error { return b.parent.inner.SetMark(mark) }
func (b *sharedBind) ParseEndpoint(s string) (conn.Endpoint, error) {
	return b.parent.inner.ParseEndpoint(s)
}
func (b *sharedBind) BatchSize() int {
	if b.batchSize > 0 {
		return b.batchSize
	}
	return b.parent.inner.BatchSize()
}
func (b *sharedBind) Send(bufs [][]byte, ep conn.Endpoint) error {
	b.parent.trackOutbound(b, bufs)
	return b.parent.inner.Send(bufs, ep)
}
func (b *sharedBind) enqueue(queueIdx int, packet inboundPacket) {
	b.mu.RLock()
	defer b.mu.RUnlock()
	if !b.opened || queueIdx >= len(b.queues) {
		return
	}
	select {
	case b.queues[queueIdx] <- packet:
	default:
		b.droppedInbound.Add(1)
	}
}
func (b *sharedBind) isOpen() bool {
	b.mu.RLock()
	defer b.mu.RUnlock()
	return b.opened
}

func (b *sharedBind) DroppedInboundPackets() uint64 {
	return b.droppedInbound.Load()
}

func inboundQueueCapacity(batchSize int) int {
	capacity := batchSize * 64
	if capacity < minInboundQueueCapacity {
		return minInboundQueueCapacity
	}
	return capacity
}
