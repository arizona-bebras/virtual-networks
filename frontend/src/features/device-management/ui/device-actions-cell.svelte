<script lang="ts">
import { Edit, MoreHorizontal, Trash } from "@lucide/svelte";
import { createMutation, getQueryClientContext } from "@tanstack/svelte-query";
import type { DeviceRelations } from "common/schemas/device/index";
import { UpdateDeviceSchema } from "common/schemas/device/update-device";
import { untrack } from "svelte";
import {
  deviceDeletionMutation,
  deviceUpdateMutation,
} from "$features/device-management/api/query";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import * as Dialog from "$shared/ui/dialog/index.js";
import * as DropdownMenu from "$shared/ui/dropdown-menu/index.js";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";

let { device }: { device: DeviceRelations } = $props();

const queryClient = getQueryClientContext();
let isEditDialogOpen = $state(false);
let currentNetworkId = $derived(getNetworkId().id);

const updateMutation = createMutation(() =>
  deviceUpdateMutation(() => {
    queryClient.invalidateQueries({ queryKey: ["userDevices"] });
    isEditDialogOpen = false;
  }),
);

const deleteDeviceMutation = createMutation(() =>
  deviceDeletionMutation(() => {
    queryClient.invalidateQueries({ queryKey: ["userDevices"] });
  }),
);

let {
  forms: form,
  formData,
  valid,
  enhance,
} = useForm(UpdateDeviceSchema, {
  onSubmit: async () => {
    updateMutation.mutate({
      networkId: currentNetworkId,
      deviceId: device.id,
      deviceInfo: {
        name: $formData.name,
        ip: $formData.ip,
        ownerId: device.ownerId,
      },
    });
    console.log(device);
    isEditDialogOpen = false;
  },
});

// Dialog.Root onOpenChange/onOpenChangeComplete не срабатывает при открытии диалога, поэтому эффект
$effect(() => {
  if (isEditDialogOpen) {
    untrack(() => {
      $formData.name = device.name;
      $formData.ip = device.ip;
    });
  }
});

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
    <form method="POST" use:enhance>
      <Form.Field {form} name="name">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Name</Form.Label>
            <Input {...props} bind:value={$formData.name} />
          {/snippet}
        </Form.Control>
        <Form.Description />
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field {form} name="ip">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>IP Address</Form.Label>
            <Input {...props} bind:value={$formData.ip} />
          {/snippet}
        </Form.Control>
        <Form.Description />
        <Form.FieldErrors />
      </Form.Field>
      <Form.Button disabled={!valid()} type="submit">Save Changes</Form.Button>
    </form>
  </Dialog.Content>
</Dialog.Root>
