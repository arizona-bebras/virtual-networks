import type { Edge, Node } from "@xyflow/svelte";

export const initialNodes: Node[] = [
  // Left side: Source Devices
  {
    id: "src-1",
    type: "device",
    data: {
      name: "MacBook Pro",
      ip: "10.0.0.2",
      online: true,
      tags: ["IT", "Laptop"],
      isSource: true,
    },
    position: { x: 50, y: 50 },
  },
  {
    id: "src-2",
    type: "device",
    data: {
      name: "Database Server",
      ip: "10.0.0.5",
      online: true,
      tags: ["Servers", "Production"],
      isSource: true,
    },
    position: { x: 50, y: 150 },
  },
  // Middle: Rules
  {
    id: "rule-1",
    type: "rule",
    data: { action: "allow", rule: "TCP 80, 443" },
    position: { x: 300, y: 80 },
  },
  {
    id: "rule-2",
    type: "rule",
    data: { action: "allow", rule: "ANY" },
    position: { x: 300, y: 175 },
  },
  // Right side: Target Devices
  {
    id: "target-1",
    type: "device",
    data: {
      name: "Web Server 01",
      ip: "10.0.0.10",
      online: true,
      tags: ["Servers", "Web"],
      isTarget: true,
    },
    position: { x: 450, y: 50 },
  },
  {
    id: "target-2",
    type: "device",
    data: {
      name: "Backup Server",
      ip: "10.0.0.20",
      online: false,
      tags: ["Servers", "Backup"],
      isTarget: true,
    },
    position: { x: 450, y: 150 },
  },
];

export const initialEdges: Edge[] = [
  {
    id: "e1",
    source: "src-1",
    target: "rule-1",
    animated: true,
    data: {
      protocol: "HTTPS",
      latency: "2ms",
      throughput: "1.2 Gbps",
      status: "Active",
    },
  },
  {
    id: "e2",
    source: "rule-1",
    target: "target-1",
    animated: true,
    data: {
      protocol: "HTTPS",
      latency: "1ms",
      throughput: "850 Mbps",
      status: "Active",
    },
  },
  {
    id: "e3",
    source: "src-2",
    target: "rule-2",
    animated: true,
    data: {
      protocol: "PostgreSQL",
      latency: "0.5ms",
      throughput: "2.4 Gbps",
      status: "Active",
    },
  },
  {
    id: "e4",
    source: "rule-2",
    target: "target-2",
    animated: true,
    data: {
      protocol: "Rsync",
      latency: "5ms",
      throughput: "450 Mbps",
      status: "Idle",
    },
  },
];
