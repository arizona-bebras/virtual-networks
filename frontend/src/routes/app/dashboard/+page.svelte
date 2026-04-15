<script lang="ts">
import {
  Background,
  Controls,
  type Edge,
  type Node,
  SvelteFlow,
} from "@xyflow/svelte";
import "@xyflow/svelte/dist/style.css";
import { Activity, ArrowRight, ShieldCheck, Zap } from "lucide-svelte";
import DeviceNode from "$lib/components/network/DeviceNode.svelte";
import RuleNode from "$lib/components/network/RuleNode.svelte";
import { Badge } from "$lib/components/ui/badge/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import { initialEdges, initialNodes } from "$lib/mock/dashboard";
import { resolveCollisions } from "$lib/utils/resolve-collisions";

const nodeTypes = {
  device: DeviceNode,
  rule: RuleNode,
};

let nodes = $state.raw<Node[]>(initialNodes);
let edges = $state.raw<Edge[]>(initialEdges);

let selectedEdge = $state<Edge | null>(null);
let isDialogOpen = $state(false);

function handleEdgeClick(event: { edge: Edge }) {
  selectedEdge = event.edge;
  isDialogOpen = true;
}

function handleNodeDragStop(event: { targetNode: Node | null }) {
  if (event.targetNode) {
    nodes = resolveCollisions(nodes, event.targetNode.id);
  }
}
</script>

<div class="h-full w-full">
  <SvelteFlow
    bind:nodes
    bind:edges
    {nodeTypes}
    colorMode="dark"
    fitView
    onedgeclick={handleEdgeClick}
    onnodedragstop={handleNodeDragStop}
  >
    <Background />
    <Controls />
  </SvelteFlow>

  <Dialog.Root bind:open={isDialogOpen}>
    <Dialog.Content class="sm:max-w-[400px]">
      <Dialog.Header>
        <Dialog.Title class="flex items-center gap-2">
          <Activity class="size-5 text-primary" />
          Connection Details
        </Dialog.Title>
        <Dialog.Description>
          Information about the relationship between these nodes.
        </Dialog.Description>
      </Dialog.Header>

      {#if selectedEdge}
        <div class="grid gap-1 py-1">
          <div
            class="flex items-center justify-between p-2 bg-muted rounded-lg border"
          >
            <div class="flex flex-col">
              <span
                class="text-[9px] text-muted-foreground uppercase font-bold"
              >
                Source
              </span>
              <span class="text-xs font-mono">{selectedEdge.source}</span>
            </div>
            <ArrowRight class="size-3 text-muted-foreground" />
            <div class="flex flex-col text-right">
              <span
                class="text-[9px] text-muted-foreground uppercase font-bold"
              >
                Target
              </span>
              <span class="text-xs font-mono">{selectedEdge.target}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 p-1">
            <div class="space-y-0.5">
              <span
                class="text-[9px] text-muted-foreground uppercase font-bold flex items-center gap-1"
              >
                <Zap class="size-2.5" /> Protocol
              </span>
              <div class="text-xs font-semibold">
                {selectedEdge.data?.protocol || "TCP"}
              </div>
            </div>
            <div class="space-y-0.5">
              <span
                class="text-[9px] text-muted-foreground uppercase font-bold flex items-center gap-1"
              >
                <Activity class="size-2.5" /> Latency
              </span>
              <div class="text-xs font-semibold">
                {selectedEdge.data?.latency || "N/A"}
              </div>
            </div>
            <div class="space-y-0.5">
              <span
                class="text-[9px] text-muted-foreground uppercase font-bold flex items-center gap-1"
              >
                <ShieldCheck class="size-2.5" /> Throughput
              </span>
              <div class="text-xs font-semibold">
                {selectedEdge.data?.throughput || "N/A"}
              </div>
            </div>
            <div class="space-y-0.5">
              <span
                class="text-[9px] text-muted-foreground uppercase font-bold flex items-center gap-1"
              >
                <Activity class="size-2.5" /> Status
              </span>
              <div>
                <Badge
                  variant={selectedEdge.data?.status === 'Active' ? 'default' : 'secondary'}
                  class="text-[9px] h-4 px-1"
                >
                  {selectedEdge.data?.status || "Unknown"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </Dialog.Content>
  </Dialog.Root>
</div>
