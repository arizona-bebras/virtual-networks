<script lang="ts">
import { createQuery } from "@tanstack/svelte-query";
import { columns } from "$features/device-management/model/device-table-columns.js";
import AddDeviceBtn from "$features/device-management/ui/add-device-btn.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import * as Card from "$shared/ui/card/index.js";
import DataTable from "$shared/ui/data-table/data-table.svelte";

import { deviceQuery } from "../api/query";

let isAddDeviceDialogOpen = $state(false);
let currentNetworkId = $derived(getNetworkId().id);

const userDevices = createQuery(() =>
  deviceQuery.userDevices(currentNetworkId),
);

// TODO: в ожидании реализации bulk delete на бэке
function bulkRemoveSelected(ids: string[]) {}

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
  {#if userDevices.isSuccess}
    <Card.Root>
      <Card.Content class="p-6">
        <DataTable
          {columns}
          data={userDevices.data || []}
          onDeleteSelected={bulkRemoveSelected}
        />
      </Card.Content>
    </Card.Root>
  {/if}
</div>
