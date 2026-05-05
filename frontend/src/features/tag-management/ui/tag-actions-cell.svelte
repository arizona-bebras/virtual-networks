<script lang="ts">
import { Edit, MoreHorizontal, Trash } from "@lucide/svelte";
import { createMutation, getQueryClientContext } from "@tanstack/svelte-query";
import type { Tag } from "common/schemas/tag/index";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import * as Dialog from "$shared/ui/dialog/index.js";
import * as DropdownMenu from "$shared/ui/dropdown-menu/index.js";
import { tagDeletionMutation } from "../api/query";
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
        Edit Tag
      </DropdownMenu.Item>
      <DropdownMenu.Item class="text-destructive" onclick={handleDelete}>
        <Trash class="mr-2 size-4" />
        Delete Tag
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>

<Dialog.Root bind:open={isEditDialogOpen}>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Edit Tag</Dialog.Title>
      <Dialog.Description>Update the details for your tag.</Dialog.Description>
    </Dialog.Header>
    <TagForm {tag} bind:dialogState={isEditDialogOpen} />
  </Dialog.Content>
</Dialog.Root>
