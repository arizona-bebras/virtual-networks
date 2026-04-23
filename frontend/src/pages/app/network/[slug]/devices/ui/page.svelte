<script lang="ts">
import { Plus } from "@lucide/svelte";
import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
import { getContext } from "svelte";
import { page } from "$app/state";
import { initialDevices } from "$entities/device/model/mock-devices.js";
import type { Device } from "$entities/device/model/types.js";
import { deviceDeletionMutation } from "$features/device-management/api/query";
import { columns } from "$features/device-management/model/device-table-columns.js";
import AddDeviceBtn from "$features/device-management/ui/add-device-btn.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import { withRowActions } from "$shared/lib/table/with-row-actions";
import { Button } from "$shared/ui/button/index.js";
import * as Card from "$shared/ui/card/index.js";
import DataTable from "$shared/ui/data-table/data-table.svelte";

import { deviceQuery } from "../api/query";

const queryClient = useQueryClient();
let isAddDeviceDialogOpen = $state(false);
let currentNetworkId = $derived(getNetworkId().id);

const userDevices = createQuery(() =>
  deviceQuery.userDevices(currentNetworkId),
);

const deleteDeviceMutation = createMutation(() =>
  deviceDeletionMutation(() => {
    queryClient.invalidateQueries({ queryKey: ["userDevices"] });
  }),
);

function removeDevice(id: string) {
  deleteDeviceMutation.mutate({ networkId: currentNetworkId, deviceId: id });
}

function removeSelected(ids: string[]) {
  // Временно для множественного удаления можно пройтись циклом или добавить bulk-endpoint
  for (const id of ids) {
    removeDevice(id);
  }
}

const tableColumns = $derived(withRowActions(columns, removeDevice));
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
          columns={tableColumns}
          data={userDevices.data || []}
          onDeleteSelected={removeSelected}
        />
      </Card.Content>
    </Card.Root>
  {/if}
</div>
