<script lang="ts">
import { createQuery } from "@tanstack/svelte-query";
import type { ColumnFiltersState, Table } from "@tanstack/table-core";
import { Debounced } from "runed";

import { goto } from "$app/navigation";
import { page } from "$app/state";
import Header from "$entities/table-page/ui/Header.svelte";
import { columns } from "$features/tag-management/model/tag-table-columns.js";
import TagDialog from "$features/tag-management/ui/tag-dialog.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import DataTable from "$shared/ui/data-table/data-table.svelte";
import { deviceTags } from "../api/query";

let isEditingDialogOpen = $state(false);

let currentNetworkId = $derived(getNetworkId().id);
let globalFilter = $state("");
const debounced = new Debounced(() => globalFilter, 500);
let columnFilters = $state<ColumnFiltersState>([]);
let selectedIds = $state<string[]>([]);
let table = $state<Table<any>>();

const userTags = createQuery(() =>
  deviceTags.userTags(currentNetworkId, debounced.current),
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
function bulkRemoveSelected() {
  console.log("Delete tags:", selectedIds);
  selectedIds = [];
}
</script>

<div class="p-2.5">
  <Header
    title="Tags"
    description="Organize your devices using tags."
    bind:globalFilter
    {selectedIds}
    {table}
  />

  <TagDialog
    bind:open={isEditingDialogOpen}
    title="Edit Tag"
    tag={editingTag}
    description="Update the details for your tag."
  />

  <DataTable
    {columns}
    data={userTags.data || []}
    bind:selectedIds
    bind:table
    onColumnFiltersChange={(filters) => (columnFilters = filters)}
  />
</div>
