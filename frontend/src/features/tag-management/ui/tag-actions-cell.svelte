<script lang="ts">
import { Edit, MoreHorizontal, Trash } from "@lucide/svelte";
import { createMutation, getQueryClientContext } from "@tanstack/svelte-query";
import type { Tag } from "common/schemas/tag/index";
import { page } from "$app/state";
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
    queryClient.invalidateQueries({ queryKey: ["userTags"] });
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
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      <Button variant="ghost" size="icon">
        <MoreHorizontal class="size-4" />
      </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end">
      <DropdownMenu.Item onSelect={() => isEditDialogOpen = true}>
        <Edit class="mr-2 size-4" />
        Редактировать
      </DropdownMenu.Item>
      <DropdownMenu.Item class="text-destructive" onclick={handleDelete}>
        <Trash class="mr-2 size-4" />
        Удалить
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>

<TagDialog
  bind:open={isEditDialogOpen}
  title="Редактирование тега"
  {tag}
  description="Обновите данные вашего тега."
/>
