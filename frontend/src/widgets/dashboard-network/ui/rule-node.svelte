<script lang="ts">
import {
  Lock,
  ShieldAlert,
  ShieldCheck,
  SquarePen,
  Trash,
} from "@lucide/svelte";
import { createMutation, useQueryClient } from "@tanstack/svelte-query";
import {
  Handle,
  type Node,
  type NodeProps,
  NodeToolbar,
  Position,
} from "@xyflow/svelte";
import type { RuleNodeData } from "$entities/node/model/types";
import { ruleDeletionMutation } from "$features/rule-management/api/query";
import RuleDialog from "$features/rule-management/ui/rule-dialog.svelte";
import { queryKeys } from "$shared/api/query-keys";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import * as Card from "$shared/ui/card/index.js";

let { id, data, selected }: NodeProps<Node<RuleNodeData>> = $props();

let isEditOpen = $state(false);

const queryClient = useQueryClient();
const networkId = $derived(getNetworkId().id);

const deleteMutation = createMutation(() =>
  ruleDeletionMutation(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.networkRules(networkId),
    });
  }),
);

function handleDelete() {
  deleteMutation.mutate({ networkId, ruleId: id });
}
</script>

<NodeToolbar {id} isVisible={selected} position={Position.Top}>
  <div
    class="flex gap-1 bg-background/95 backdrop-blur border border-border p-1 rounded-xl shadow-lg"
  >
    <Button
      variant="ghost"
      size="icon"
      class="size-7"
      onclick={() => (isEditOpen = true)}
    >
      <SquarePen size={12} />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      class="size-7 text-destructive hover:bg-destructive/10"
      onclick={handleDelete}
    >
      <Trash size={12} />
    </Button>
  </div>
</NodeToolbar>

<Card.Root
  ondblclick={() => (isEditOpen = true)}
  class="group relative w-36 bg-background border-border border-2 shadow-sm hover:border-gray-700 transition-all duration-200"
>
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
    <div class="flex flex-col min-w-0 flex-1">
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

<RuleDialog
  bind:open={isEditOpen}
  title="Редактировать правило"
  description="Обновите параметры правила"
  rule={{
    id,
    description: data.name,
    protocol: data.protocol as "TCP" | "UDP" | "ICMP" | null,
    port: data.port !== '*' ? Number(data.port) : null,
    sourceId: data.sourceId,
    destId: data.destId,
    source: null,
    dest: null,
  }}
/>
