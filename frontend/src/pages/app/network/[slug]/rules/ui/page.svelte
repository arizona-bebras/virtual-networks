<script lang="ts">
import { Plus } from "@lucide/svelte";
import { createQuery } from "@tanstack/svelte-query";
import type { ColumnFiltersState, Table } from "@tanstack/table-core";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import Header from "$entities/table-page/ui/Header.svelte";
import { columns } from "$features/rule-management/model/rule-table-columns";
import RuleDialog from "$features/rule-management/ui/rule-dialog.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import * as Card from "$shared/ui/card/index.js";
import DataTable from "$shared/ui/data-table/data-table.svelte";
import { userRules } from "../api/query";

let isAddDialogOpen = $state(false);
let isEditingDialogOpen = $state(false);
let selectedIds = $state<string[]>([]);

let globalFilter = $state("");
let columnFilters = $state<ColumnFiltersState>([]);
let table = $state<Table<any>>("");

let sourceTagsFilter = $derived(
  (
    columnFilters.find((f) => f.id === "sourceTag")?.value as
      | { id: string; name: string }[]
      | undefined
  )?.map((t) => t.id),
);

let destTagsFilter = $derived(
  (
    columnFilters.find((f) => f.id === "destTag")?.value as
      | { id: string; name: string }[]
      | undefined
  )?.map((t) => t.id),
);

const currentNetworkId = $derived(getNetworkId().id);
const userRulesQuery = createQuery(() =>
  userRules(currentNetworkId, globalFilter, sourceTagsFilter, destTagsFilter),
);

let ruleIdSearchParam = $derived(page.url.searchParams.get("editRule"));
let editingRule = $derived(
  userRulesQuery.data?.find((r) => r.id === ruleIdSearchParam),
);

$effect(() => {
  if (ruleIdSearchParam) {
    isEditingDialogOpen = true;
  }
});

$effect(() => {
  if (!isEditingDialogOpen && ruleIdSearchParam) {
    const newUrl = new URL(page.url);
    newUrl.searchParams.delete("editRule");
    goto(newUrl, { replaceState: true, keepFocus: true });
  }
});

function bulkRemoveSelected(_ids: string[]) {
  console.log("Delete rules:", _ids);
}
</script>

<div class="">
  <Header
    title="Rules"
    description="Создавайте свои правила для устройств"
    {selectedIds}
    bind:globalFilter
    {table}
  />

  <RuleDialog
    bind:open={isEditingDialogOpen}
    title="Edit Rule"
    rule={editingRule}
    description="Update the details for your rule."
  />

  <Card.Root>
    <Card.Content class="p-6">
      <DataTable
        {columns}
        data={userRulesQuery.data || []}
        filterPlaceholder="Search by name..."
        onDeleteSelected={bulkRemoveSelected}
        onGlobalFilterChange={(value) => (globalFilter = value)}
        onColumnFiltersChange={(filters) => (columnFilters = filters)}
      />
    </Card.Content>
  </Card.Root>
</div>
