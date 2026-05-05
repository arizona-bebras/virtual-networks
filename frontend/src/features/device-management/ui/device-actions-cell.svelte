<script lang="ts">
import { Edit, MoreHorizontal, Trash } from "@lucide/svelte";
import { createMutation, getQueryClientContext } from "@tanstack/svelte-query";
import type { DeviceRelations } from "common/schemas/device/index";
import { deviceDeletionMutation } from "$features/device-management/api/query";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import * as Dialog from "$shared/ui/dialog/index.js";
import * as DropdownMenu from "$shared/ui/dropdown-menu/index.js";
import DeviceForm from "./device-form.svelte";

let { device }: { device: DeviceRelations } = $props();

const queryClient = getQueryClientContext();
let isEditDialogOpen = $state(false);
let currentNetworkId = $derived(getNetworkId().id);

const deleteDeviceMutation = createMutation(() =>
  deviceDeletionMutation(() => {
    queryClient.invalidateQueries({ queryKey: ["userDevices"] });
  }),
);

function handleDelete() {
  deleteDeviceMutation.mutate({
    networkId: currentNetworkId,
    deviceId: device.id,
  });
}
</script>

<div class="text-right">
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      <Button variant="ghost" size="icon">
        <MoreHorizontal class="size-4" />
      </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end">
      <DropdownMenu.Item onSelect={() => isEditDialogOpen = true}>
        <Edit class="mr-2 size-4" />
        Edit Device
      </DropdownMenu.Item>
      <DropdownMenu.Item class="text-destructive" onclick={handleDelete}>
        <Trash class="mr-2 size-4" />
        Delete Device
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>

<Dialog.Root bind:open={isEditDialogOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit Device</Dialog.Title>
      <Dialog.Description>
        Update the details for your device.
      </Dialog.Description>
    </Dialog.Header>
    <DeviceForm {device} bind:dialogState={isEditDialogOpen} />
  </Dialog.Content>
</Dialog.Root>
