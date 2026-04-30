<script lang="ts">
import { createQuery } from "@tanstack/svelte-query";
import type { ColumnFiltersState } from "@tanstack/table-core";
import { columns } from "$features/device-management/model/device-table-columns.js";
import AddDeviceBtn from "$features/device-management/ui/add-device-btn.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import * as Card from "$shared/ui/card/index.js";
import DataTable from "$shared/ui/data-table/data-table.svelte";

import { deviceQuery } from "../api/query";

let isAddDeviceDialogOpen = $state(false);
let currentNetworkId = $derived(getNetworkId().id);
let globalFilter = $state("");
let columnFilters = $state<ColumnFiltersState>([]);

let tagsFilter = $derived(
  columnFilters.find((f) => f.id === "tags")?.value as string | undefined,
);
let onwerFilter = $derived(
  columnFilters.find((f) => f.id === "owner")?.value as string | undefined,
);

$inspect(columnFilters);

const userDevices = createQuery(() =>
  deviceQuery.userDevices({
    networkId: currentNetworkId,
    q: globalFilter,
    tags: tagsFilter,
    owner_id: onwerFilter,
  }),
);

// TODO: в ожидании реализации bulk delete на бэке
function bulkRemoveSelected(_ids: string[]) {}

// const tableColumns = $derived(withRowActions(columns, removeDevice));
</script>

<div class="p-8">
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Devices</h1>
      <p class="text-muted-foreground">
        Manage and monitor your network devices.
      </p>
    </div>

    <AddDeviceBtn bind:open={isAddDeviceDialogOpen} />
  </div>

  <Card.Root>
    <Card.Content class="p-6">
      <DataTable
        {columns}
        data={userDevices.data || []}
        filterPlaceholder="Search by name or ID..."
        onDeleteSelected={bulkRemoveSelected}
        onGlobalFilterChange={(value) => (globalFilter = value)}
        onColumnFiltersChange={(filters) => (columnFilters = filters)}
      />
    </Card.Content>
  </Card.Root>
</div>
