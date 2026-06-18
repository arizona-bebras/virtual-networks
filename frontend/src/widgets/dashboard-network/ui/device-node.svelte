<script lang="ts">
import { Monitor, SquarePen } from "@lucide/svelte";
import {
  Handle,
  type Node,
  type NodeProps,
  NodeToolbar,
  Position,
} from "@xyflow/svelte";
import type { DeviceNodeData } from "$entities/node/model/types";
import { getDeviceEdit } from "$shared/lib/device-edit-context";
import { Button } from "$shared/ui/button/index.js";
import * as Card from "$shared/ui/card/index.js";

let { id, data, selected }: NodeProps<Node<DeviceNodeData>> = $props();
const deviceEdit = getDeviceEdit();
</script>

<NodeToolbar {id} isVisible={selected} position={Position.Top}>
  <div
    class="flex gap-1 bg-background/95 backdrop-blur border border-border p-1 rounded-xl shadow-lg"
  >
    <Button
      variant="ghost"
      size="icon"
      class="size-7"
      onclick={() => deviceEdit.open(data.device)}
    >
      <SquarePen size={12} />
    </Button>
  </div>
</NodeToolbar>

<Card.Root
  class="w-40 bg-card border-border border shadow-sm hover:shadow-md transition-all duration-200"
>
  <div class="flex items-center gap-2 p-2">
    <div class="p-1.5 rounded-md bg-secondary flex-shrink-0">
      <Monitor size={14} class="text-muted-foreground" />
    </div>
    <div class="flex flex-col min-w-0">
      <span class="text-[10px] font-bold truncate leading-tight">
        {data.name}
      </span>
      <span class="text-[9px] text-muted-foreground font-mono truncate">
        {data.ip}
      </span>
    </div>
  </div>
</Card.Root>

<Handle
  type="target"
  position={Position.Left}
  class="!size-3 hover:!bg-secondary/30 !border-2 !border-primary transition-colors"
/>
<Handle
  type="source"
  position={Position.Right}
  class="!size-3 hover:!bg-secondary/30 !border-2 !border-primary transition-colors"
/>
