<script lang="ts">
import { Tag } from "@lucide/svelte";
import {
  Handle,
  type Node,
  type NodeProps,
  NodeToolbar,
  Position,
} from "@xyflow/svelte";
import type { TagNodeData } from "$entities/node/model/types";
import * as Card from "$shared/ui/card/index.js";

let { id, data }: NodeProps<Node<TagNodeData>> = $props();
</script>

<Card.Root class="w-32 bg-card border-border shadow-sm overflow-hidden">
  <div class="flex items-center gap-2 p-2">
    <div
      class="flex items-center justify-center size-6 rounded-md"
      style="background-color: {data.color || '#3b82f6'}20"
    >
      <Tag size={14} style="color: {data.color || '#3b82f6'}" />
    </div>
    <div class="flex flex-col min-w-0">
      <span class="text-[10px] font-bold truncate leading-tight">
        {data.name}
      </span>
      {#if data.id}
        <span
          class="text-[8px] font-mono text-muted-foreground truncate leading-tight"
        >
          {data.id.slice(0, 8)}
        </span>
      {/if}
    </div>
  </div>
</Card.Root>

{#if import.meta.env.DEV}
  <NodeToolbar>{id}</NodeToolbar>
{/if}

<Handle type="target" position={Position.Left} />
<Handle type="source" position={Position.Right} />
