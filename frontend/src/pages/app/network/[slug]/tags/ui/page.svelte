<script lang="ts">
import { Plus } from "@lucide/svelte";
import { createQuery } from "@tanstack/svelte-query";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { columns } from "$features/tag-management/model/tag-table-columns.js";
import TagDialog from "$features/tag-management/ui/tag-dialog.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import * as Card from "$shared/ui/card/index.js";
import DataTable from "$shared/ui/data-table/data-table.svelte";
import { deviceTags } from "../api/query";

let isDialogOpen = $state(false);
let isEditingDialogOpen = $state(false);

let currentNetworkId = $derived(getNetworkId().id);
let globalFilter = $state("");

const userTags = createQuery(() =>
  deviceTags.userTags(currentNetworkId, globalFilter),
);

let tagIdSearchParam = $derived(page.url.searchParams.get("editTag"));
let editingTag = $derived(
  userTags.data?.find((t) => t.id === tagIdSearchParam),
);

$effect(() => {
  if (tagIdSearchParam) {
    isEditingDialogOpen = true;
  }
});

$effect(() => {
  if (!isEditingDialogOpen && tagIdSearchParam) {
    const newUrl = new URL(page.url);
    newUrl.searchParams.delete("editTag");
    goto(newUrl, { replaceState: true, keepFocus: true });
  }
});

// TODO: в ожидании реализации bulk delete на бэке
function bulkRemoveSelected(_ids: string[]) {}
</script>

<div class="p-8">
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Tags</h1>
      <p class="text-muted-foreground">Organize your devices using tags.</p>
    </div>
    <Button onclick={() => isDialogOpen = true}>
      <Plus class="mr-2 size-4" />
      Add Tag
    </Button>
  </div>

  <TagDialog
    bind:open={isDialogOpen}
    title="Add Tag"
    description="Create a new tag to group your devices."
  />

  <TagDialog
    bind:open={isEditingDialogOpen}
    title="Edit Tag"
    tag={editingTag}
    description="Update the details for your tag."
  />

  <Card.Root>
    <Card.Content class="p-6">
      <DataTable
        {columns}
        data={userTags.data || []}
        onDeleteSelected={bulkRemoveSelected}
        onGlobalFilterChange={(value) => (globalFilter = value)}
      />
    </Card.Content>
  </Card.Root>
</div>
