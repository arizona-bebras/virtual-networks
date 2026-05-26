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
import LinkButton from "$entities/node/ui/LinkButton.svelte";
import { colorVariants } from "$shared/lib/tag-color-mapping";
import * as Card from "$shared/ui/card/index.js";

let { id, data }: NodeProps<Node<TagNodeData>> = $props();

let color = $derived(data.color);
</script>

<Card.Root
  class="group relative w-36 bg-card border {color ? `${colorVariants[color].borderColor} ${colorVariants[color].backgroundColor}` : '' } shadow-sm overflow-hidden hover:brightness-75 hover:opacity-75 hover:shadow-md transition-all duration-200 rounded-[14px]"
>
  <div class="flex items-center gap-2 p-1">
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
      <!-- {#if data.id}
        <span
          class="text-[8px] font-mono text-muted-foreground truncate leading-tight"
        >
          {data.id.slice(0, 8)}
        </span>
      {/if} -->
    </div>
    <LinkButton
      redirectLink={`/app/network/${page.params.slug}/tags?editTag=${data.id}`}
    />
  </div>
</Card.Root>

{#if import.meta.env.DEV}
  <NodeToolbar>{id}</NodeToolbar>
{/if}

<Handle type="target" position={Position.Left} />
<Handle type="source" position={Position.Right} />
