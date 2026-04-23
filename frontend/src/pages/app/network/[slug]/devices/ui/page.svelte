<script lang="ts">
import { Plus } from "@lucide/svelte";
import { createQuery } from "@tanstack/svelte-query";
import { getContext } from "svelte";
import { page } from "$app/state";
import { initialDevices } from "$entities/device/model/mock-devices.js";
import type { Device } from "$entities/device/model/types.js";
import { columns } from "$features/device-management/model/device-table-columns.js";
import AddDeviceBtn from "$features/device-management/ui/add-device-btn.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import { withRowActions } from "$shared/lib/table/with-row-actions";
import { Button } from "$shared/ui/button/index.js";
import * as Card from "$shared/ui/card/index.js";
import DataTable from "$shared/ui/data-table/data-table.svelte";
import * as Dialog from "$shared/ui/dialog/index.js";
import { Input } from "$shared/ui/input/index.js";
import { Label } from "$shared/ui/label/index.js";
import { deviceQuery } from "../api/query";

let devices = $state<Device[]>(initialDevices);
let isAddDeviceDialogOpen = $state(false);
let newDeviceData = $state({ name: "", ip: "", tags: "" });
let currentNetworkId = $derived(getNetworkId().id);
// function addDevice() {
//   if (!newDeviceData.name) return;

//   const device: Device = {
//     id: Math.random().toString(36).substring(2, 9),
//     name: newDeviceData.name,
//     ip: newDeviceData.ip || `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
//     status: "online",
//     tags: newDeviceData.tags
//       .split(",")
//       .map((tag) => tag.trim())
//       .filter(Boolean),
//   };

//   devices = [...devices, device];
//   newDeviceData = { name: "", ip: "", tags: "" };
//   isAddDeviceDialogOpen = false;
// }

function removeDevice(id: string) {
  devices = devices.filter((device) => device.id !== id);
}

function removeSelected(ids: string[]) {
  devices = devices.filter((device) => !ids.includes(device.id));
}

const userDevicesQuery = createQuery(() =>
  deviceQuery.userDevices(currentNetworkId),
);

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
    <!-- <Dialog.Root bind:open={isDialogOpen}>
      <Dialog.Trigger>
        <Button>
          <Plus class="mr-2 size-4" />
          Add Device
        </Button>
      </Dialog.Trigger>
      <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
          <Dialog.Title>Add Device</Dialog.Title>
          <Dialog.Description>
            Register a new device to your virtual network.
          </Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-2 py-4">
          <div class="grid gap-1">
            <Label for="name">Name</Label>
            <Input
              id="name"
              bind:value={newDeviceData.name}
              placeholder="My Device"
            />
          </div>
          <div class="grid gap-1">
            <Label for="ip">IP Address (Optional)</Label>
            <Input
              id="ip"
              bind:value={newDeviceData.ip}
              placeholder="10.0.0.x"
            />
          </div>
          <div class="grid gap-1">
            <Label for="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              bind:value={newDeviceData.tags}
              placeholder="servers, web, it"
            />
          </div>
        </div>
        <Dialog.Footer>
          <Button type="button" onclick={addDevice}>Save Device</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root> -->
  </div>

  <Card.Root>
    <Card.Content class="p-6">
      <DataTable
        columns={tableColumns}
        data={devices}
        onDeleteSelected={removeSelected}
      />
    </Card.Content>
  </Card.Root>
</div>
