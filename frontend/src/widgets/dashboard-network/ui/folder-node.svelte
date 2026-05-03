<script lang="ts">
import { ChevronRight, Folder } from "@lucide/svelte";
import {
  Handle,
  type Node,
  type NodeProps,
  NodeToolbar,
  Position,
} from "@xyflow/svelte";
import type { FolderNodeData } from "$entities/node/model/types";
import * as Card from "$shared/ui/card/index.js";

let { id, data }: NodeProps<Node<FolderNodeData>> = $props();

function handleClick(e: MouseEvent) {
  if (data.onClick) {
    data.onClick(data);
  } else {
    console.log("Folder clicked:", data);
  }
}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<Card.Root
  class="w-44 bg-muted/10 border-border hover:bg-muted/30 transition-all cursor-pointer group shadow-md border-2"
  onclick={handleClick}
>
  <div class="p-3 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div
        class="p-2 bg-amber-500/20 rounded-lg group-hover:scale-110 transition-transform"
      >
        <Folder size={18} class="text-amber-500 fill-amber-500/20" />
      </div>
      <div class="flex flex-col min-w-0">
        <span class="text-xs font-bold truncate uppercase tracking-tight">
          {data.label || data.name || 'Group'}
        </span>
        <span class="text-[9px] text-muted-foreground font-medium">
          {data.count || 0} entities
        </span>
      </div>
    </div>
    <ChevronRight
      size={14}
      class="text-muted-foreground group-hover:translate-x-1 transition-transform"
    />
  </div>
</Card.Root>

{#if (import.meta.env.DEV)}
  <NodeToolbar>{id}</NodeToolbar>
{/if}

<Handle type="target" position={Position.Left} />
<Handle type="source" position={Position.Right} />
