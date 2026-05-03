<script lang="ts">
import { Lock, ShieldAlert, ShieldCheck } from "@lucide/svelte";
import {
  Handle,
  type Node,
  type NodeProps,
  NodeToolbar,
  Position,
} from "@xyflow/svelte";
import type { RuleNodeData } from "$entities/node/model/types";
import * as Card from "$shared/ui/card/index.js";

let { id, data }: NodeProps<Node<RuleNodeData>> = $props();
</script>

<Card.Root class="w-36 bg-background border-border border-2 shadow-sm">
  <div class="p-2 flex items-center gap-2">
    <div class="p-1.5 rounded-md bg-secondary flex-shrink-0">
      {#if data.action === 'allow'}
        <ShieldCheck size={16} class="text-green-500" />
      {:else if data.action === 'deny'}
        <ShieldAlert size={16} class="text-red-500" />
      {:else}
        <Lock size={16} class="text-primary" />
      {/if}
    </div>
    <div class="flex flex-col min-w-0">
      <div class="flex items-center gap-1.5">
        <span
          class="text-[9px] font-black uppercase text-muted-foreground leading-none"
        >
          {data.protocol || 'TCP'}
        </span>
        <span
          class="text-[9px] font-mono font-bold leading-none bg-muted px-1 rounded"
        >
          {data.port || '*'}
        </span>
      </div>
      <span class="text-[10px] truncate font-semibold mt-0.5">
        {data.name || 'Default Rule'}
      </span>
    </div>
  </div>
</Card.Root>

{#if (import.meta.env.DEV)}
  <NodeToolbar>{id}</NodeToolbar>
{/if}

<Handle type="target" position={Position.Left} />
<Handle type="source" position={Position.Right} />
