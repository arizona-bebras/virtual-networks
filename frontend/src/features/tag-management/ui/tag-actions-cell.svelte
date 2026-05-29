<script lang="ts">
import { SquarePen, Trash } from "@lucide/svelte";
import { createMutation, getQueryClientContext } from "@tanstack/svelte-query";
import type { Tag } from "common/schemas/tag/index";
import { page } from "$app/state";
import { queryKeys } from "$shared/api/query-keys";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import * as Dialog from "$shared/ui/dialog/index.js";
import * as DropdownMenu from "$shared/ui/dropdown-menu/index.js";
import { tagDeletionMutation } from "../api/query";
import TagDialog from "./tag-dialog.svelte";
import TagForm from "./tag-form.svelte";

let { tag }: { tag: Tag } = $props();

const queryClient = getQueryClientContext();
let isEditDialogOpen = $state(false);
let currentNetworkId = $derived(getNetworkId().id);

const deleteMutation = createMutation(() =>
  tagDeletionMutation(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.network(currentNetworkId),
    });
  }),
);

function handleDelete() {
  deleteMutation.mutate({
    networkId: currentNetworkId,
    tagId: tag.id,
  });
}
</script>

<div class="text-right">
  <Button variant="ghost" size="icon" onclick={() => isEditDialogOpen = true}>
    <SquarePen class="size-4" />
  </Button>
  <Button
    variant="destructive"
    size="icon"
    class="rounded-[6px]"
    onclick={handleDelete}
  >
    <Trash class="size-4" />
  </Button>
</div>

<TagDialog
  bind:open={isEditDialogOpen}
  title="Редактирование тега"
  {tag}
  description="Обновите данные вашего тега"
/>
