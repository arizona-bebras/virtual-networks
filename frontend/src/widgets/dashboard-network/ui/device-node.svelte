<script lang="ts">
import { Handle, Position } from "@xyflow/svelte";
import { Monitor } from "@lucide/svelte";
import { Badge } from "$shared/ui/badge/index.js";
import * as Card from "$shared/ui/card/index.js";

let { data } = $props();
</script>

<Card.Root class="w-48 bg-card border-border shadow-sm">
  <Card.Header class="border-b">
    <div class="flex items-center justify-between gap-1">
      <div class="flex items-center gap-1 min-w-0">
        <Monitor class="size-3 text-primary flex-shrink-0" />
        <Card.Title class="text-[10px] font-bold truncate leading-none">
          {data.name}
        </Card.Title>
      </div>
      <div
        class={`size-1.5 rounded-full flex-shrink-0 ${data.online ? 'bg-green-500' : 'bg-red-500'}`}
      ></div>
    </div>
  </Card.Header>
  <Card.Content class="flex flex-col gap-1 py-1">
    <div class="text-[9px] font-mono text-muted-foreground leading-none">
      {data.ip}
    </div>
    <div class="flex flex-wrap gap-0.5">
      {#each data.tags as tag}
        <Badge
          variant="secondary"
          class="text-[8px] px-1 py-0 h-3 border-none leading-none"
        >
          {tag}
        </Badge>
      {/each}
    </div>
  </Card.Content>
</Card.Root>

{#if data.isSource}
  <Handle type="source" position={Position.Right} />
{/if}
{#if data.isTarget}
  <Handle type="target" position={Position.Left} />
{/if}
