<script lang="ts">
import { createQuery } from "@tanstack/svelte-query";
import type { ColumnFiltersState, Table } from "@tanstack/table-core";
import type { DeviceRelations } from "common/schemas/device/index";
import type { Event } from "common/schemas/event/index";
import { Debounced } from "runed";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import Header from "$entities/table-page/ui/Header.svelte";
import DeviceDialog from "$features/device-management/ui/device-dialog.svelte";
import { columns } from "$features/event-managment/model/event-table-columns";
import { mockEvents } from "$features/event-managment/model/mock";
import { getNetworkId } from "$shared/lib/network-id-context";
import DataTable from "$shared/ui/data-table/data-table.svelte";

let globalFilter = $state("");
const debounced = new Debounced(() => globalFilter, 500);
let columnFilters = $state<ColumnFiltersState>([]);
let selectedIds = $state<string[]>([]);
let table = $state<Table<Event>>();

// TODO: в ожидании реализации bulk delete на бэке
// biome-ignore lint/correctness/noUnusedVariables: <waiting for implementation>
function bulkRemoveSelected() {
  console.log("Delete devices:", selectedIds);
  selectedIds = [];
}
</script>

<div class="p-2.5">
  <Header
    title="События"
    description="Отслеживайте все изменения, произошедшие в сети"
    bind:globalFilter
    {selectedIds}
    {table}
  />

  <DataTable
    {columns}
    data={mockEvents || []}
    bind:selectedIds
    bind:table
    onColumnFiltersChange={(filters) => (columnFilters = filters)}
  />
</div>
