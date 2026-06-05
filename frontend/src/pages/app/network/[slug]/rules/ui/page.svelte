<script lang="ts">
import { Plus } from "@lucide/svelte";
import { createQuery } from "@tanstack/svelte-query";
import type { ColumnFiltersState, Table } from "@tanstack/table-core";
import type { RuleRelation } from "common/schemas/rule/index";
import { Debounced } from "runed";
import Header from "$entities/table-page/ui/Header.svelte";
import { columns } from "$features/rule-management/model/rule-table-columns";
import SearchParamsHandler from "$features/rule-management/ui/rule-param-handler.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import * as Card from "$shared/ui/card/index.js";
import DataTable from "$shared/ui/data-table/data-table.svelte";
import { userRules } from "../api/query";

let isAddDialogOpen = $state(false);
let selectedIds = $state<string[]>([]);

let globalFilter = $state("");
const debounced = new Debounced(() => globalFilter, 500);
let columnFilters = $state<ColumnFiltersState>([]);
let table = $state<Table<RuleRelation>>();

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
  userRules(
    currentNetworkId,
    debounced.current,
    sourceTagsFilter,
    destTagsFilter,
  ),
);

// biome-ignore lint/correctness/noUnusedVariables: <waitng for implementaion>
function bulkRemoveSelected(_ids: string[]) {
  console.log("Delete rules:", _ids);
}
</script>

<div class="p-2.5">
  <Header
    title="Правила"
    description="Создавайте свои правила для устройств"
    {selectedIds}
    bind:globalFilter
    {table}
  />

  <SearchParamsHandler rules={userRulesQuery.data} bind:globalFilter />

  <DataTable
    {columns}
    data={userRulesQuery.data || []}
    bind:selectedIds
    bind:table
    onColumnFiltersChange={(filters) => (columnFilters = filters)}
  />
</div>
