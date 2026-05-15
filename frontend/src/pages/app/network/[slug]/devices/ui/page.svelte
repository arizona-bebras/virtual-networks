<script lang="ts">
import { Plus } from "@lucide/svelte";
import { createQuery } from "@tanstack/svelte-query";
import type { ColumnFiltersState } from "@tanstack/table-core";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { columns } from "$features/device-management/model/device-table-columns.js";
import DeviceDialog from "$features/device-management/ui/device-dialog.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import * as Card from "$shared/ui/card/index.js";
import DataTable from "$shared/ui/data-table/data-table.svelte";

import { deviceQuery } from "../api/query";

let isAddDeviceDialogOpen = $state(false);
let isEditingDialogOpen = $state(false);

let currentNetworkId = $derived(getNetworkId().id);
let globalFilter = $state("");
let columnFilters = $state<ColumnFiltersState>([]);

let tagsFilter = $derived(
  (
    columnFilters.find((f) => f.id === "tags")?.value as
      | { id: string; name: string }[]
      | undefined
  )?.map((t) => t.id),
);
let onwerFilter = $derived(
  columnFilters.find((f) => f.id === "owner")?.value as string | undefined,
);

const userDevices = createQuery(() =>
  deviceQuery.userDevices({
    networkId: currentNetworkId,
    q: globalFilter,
    tags: tagsFilter,
    owner_id: onwerFilter,
  }),
);

let deviceIdSearchParam = $derived(page.url.searchParams.get("editDevice"));
let editingDevice = $derived(
  userDevices.data?.find((d) => d.id === deviceIdSearchParam),
);

$effect(() => {
  if (deviceIdSearchParam) {
    isEditingDialogOpen = true;
  }
});

$effect(() => {
  if (!isEditingDialogOpen && deviceIdSearchParam) {
    const newUrl = new URL(page.url);
    newUrl.searchParams.delete("editDevice");
    goto(newUrl, { replaceState: true, keepFocus: true });
  }
});

// TODO: в ожидании реализации bulk delete на бэке
function bulkRemoveSelected(_ids: string[]) {}
</script>

<div class="p-8">
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Devices</h1>
      <p class="text-muted-foreground">
        Manage and monitor your network devices.
      </p>
    </div>

    <Button onclick={() => (isAddDeviceDialogOpen = true)}>
      <Plus class="mr-2 size-4" />
      Add Device
    </Button>
  </div>

  <DeviceDialog
    bind:open={isAddDeviceDialogOpen}
    title="Add Device"
    description="Register a new device to your virtual network."
  />

  <DeviceDialog
    bind:open={isEditingDialogOpen}
    title="Edit Device"
    device={editingDevice}
    description="Update the details for your device."
  />

  <Card.Root>
    <Card.Content class="p-6">
      <DataTable
        {columns}
        data={userDevices.data || []}
        filterPlaceholder="Search by name..."
        onDeleteSelected={bulkRemoveSelected}
        onGlobalFilterChange={(value) => (globalFilter = value)}
        onColumnFiltersChange={(filters) => (columnFilters = filters)}
      />
    </Card.Content>
  </Card.Root>
</div>
