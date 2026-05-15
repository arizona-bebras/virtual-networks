<script lang="ts">
import { Plus } from "@lucide/svelte";
import { createQuery } from "@tanstack/svelte-query";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { columns } from "$features/rule-management/model/rule-table-columns";
import RuleDialog from "$features/rule-management/ui/rule-dialog.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import * as Card from "$shared/ui/card/index.js";
import DataTable from "$shared/ui/data-table/data-table.svelte";
import { userRules } from "../api/query";

let isAddRuleDialogOpen = $state(false);
let isEditingDialogOpen = $state(false);

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

<div class="p-8">
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Rules</h1>
      <p class="text-muted-foreground">Manage network access control rules.</p>
    </div>

    <Button onclick={() => (isAddRuleDialogOpen = true)}>
      <Plus class="mr-2 size-4" />
      Add Rule
    </Button>
  </div>

  <RuleDialog
    bind:open={isAddRuleDialogOpen}
    title="Add Rule"
    description="Create a new network access control rule."
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
