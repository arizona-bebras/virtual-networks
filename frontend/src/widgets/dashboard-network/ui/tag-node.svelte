<script lang="ts">
import { SquarePen, Tag } from "@lucide/svelte";
import {
  Handle,
  type Node,
  type NodeProps,
  NodeToolbar,
  Position,
} from "@xyflow/svelte";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import type { TagNodeData } from "$entities/node/model/types";
import * as Card from "$shared/ui/card/index.js";

let { id, data }: NodeProps<Node<TagNodeData>> = $props();

function handleEdit(e: MouseEvent) {
  e.stopPropagation();
  const slug = page.params.slug;
  goto(`/app/network/${slug}/tags?editTag=${data.id}`);
}
</script>

<Card.Root
  class="group relative w-36 bg-card border-border shadow-sm overflow-hidden hover:border-primary hover:bg-accent/50 hover:shadow-md transition-all duration-200"
>
  <div class="flex items-center gap-2 p-2">
    <div
      class="flex items-center justify-center size-6 rounded-md flex-shrink-0"
      style="background-color: {data.color || '#3b82f6'}20"
    >
      <Tag size={14} style="color: {data.color || '#3b82f6'}" />
    </div>
    <div class="flex flex-col min-w-0 flex-1">
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
    <button
      type="button"
      class="opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-primary/10 rounded-md"
      onclick={handleEdit}
      title="Edit Tag"
    >
      <SquarePen size={12} class="text-muted-foreground hover:text-primary" />
    </button>
  </div>
</Card.Root>

{#if import.meta.env.DEV}
  <NodeToolbar>{id}</NodeToolbar>
{/if}

<Handle type="target" position={Position.Left} />
<Handle type="source" position={Position.Right} />
