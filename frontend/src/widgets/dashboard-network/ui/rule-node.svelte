<script lang="ts">
import { Handle, Position } from "@xyflow/svelte";
import { ShieldAlert, ShieldCheck } from "@lucide/svelte";
import * as Card from "$shared/ui/card/index.js";

let { data } = $props();
</script>

<Card.Root class="w-28 bg-muted/30 border-dashed border-border shadow-none">
  <div class="px-1 py-0.5 flex items-center gap-1 h-6">
    {#if data.action === 'allow'}
      <ShieldCheck class="size-3 text-green-500 flex-shrink-0" />
    {:else}
      <ShieldAlert class="size-3 text-red-500 flex-shrink-0" />
    {/if}
    <div class="flex flex-col min-w-0">
      <span
        class="text-[7px] font-bold text-muted-foreground uppercase leading-none"
      >
        RULE
      </span>
      <span
        class="text-[9px] font-mono font-bold truncate tracking-tight leading-none"
      >
        {data.rule}
      </span>
    </div>
  </div>
</Card.Root>

<Handle type="target" position={Position.Left} />
<Handle type="source" position={Position.Right} />
