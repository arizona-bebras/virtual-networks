<script lang="ts">
import { SquarePen, Tag, Trash } from "@lucide/svelte";
import { createMutation, getQueryClientContext } from "@tanstack/svelte-query";
import {
  Handle,
  type Node,
  type NodeProps,
  NodeToolbar,
  Position,
} from "@xyflow/svelte";
import type { TagNodeData } from "$entities/node/model/types";
import TagDialog from "$features/tag-management/ui/tag-dialog.svelte";
import { tagDeletionMutation } from "$features/tag-management/api/query";
import { queryKeys } from "$shared/api/query-keys";
import { colorVariants } from "$shared/lib/tag-color-mapping";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import * as Card from "$shared/ui/card/index.js";

let { id, data, selected }: NodeProps<Node<TagNodeData>> = $props();

let colorObj = $derived(colorVariants[data.color ?? "gray"]);
let isEditOpen = $state(false);

const queryClient = getQueryClientContext();
let currentNetworkId = $derived(getNetworkId().id);

const deleteMutation = createMutation(() =>
  tagDeletionMutation(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.network(currentNetworkId),
    });
  }),
);

function handleDelete() {
  deleteMutation.mutate({ networkId: currentNetworkId, tagId: data.id });
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
  class="group relative w-36 bg-card border {colorObj.borderColor} {colorObj.backgroundColor} shadow-sm overflow-hidden hover:brightness-75 hover:opacity-75 hover:shadow-md transition-all duration-200 rounded-[14px]"
>
  <div class="flex items-center gap-2 p-1">
    <div
      class="flex items-center justify-center size-6 rounded-md shrink-0 {colorObj.backgroundColor}"
    >
      <Tag size={14} class={colorObj.textColor} />
    </div>
    <div class="flex flex-col min-w-0 flex-1">
      <span class="text-[10px] font-bold truncate leading-tight">
        {data.name}
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

<TagDialog
  bind:open={isEditOpen}
  title="Редактировать тег"
  description="Обновите данные тега"
  tag={{ id: data.id, name: data.name, color: data.color === 'gray' ? null : data.color, devicesCount: data.count }}
/>
