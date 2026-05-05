<script lang="ts">
import { createMutation, getQueryClientContext } from "@tanstack/svelte-query";
import { CreateDeviceSchema } from "common/schemas/device/create-device";
import type { DeviceRelations } from "common/schemas/device/index";
import { onMount } from "svelte";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import { deviceСreationQuery, deviceUpdateMutation } from "../api/query";

let {
  device,
  dialogState = $bindable(),
}: { device?: DeviceRelations; dialogState: boolean } = $props();

const queryClient = getQueryClientContext();
let currentNetworkId = $derived(getNetworkId().id);

const creationMutation = createMutation(() =>
  deviceСreationQuery(() => {
    queryClient.invalidateQueries({ queryKey: ["userDevices"] });
    dialogState = false;
  }),
);

const updateMutation = createMutation(() =>
  deviceUpdateMutation(() => {
    queryClient.invalidateQueries({ queryKey: ["userDevices"] });
    dialogState = false;
  }),
);

let {
  forms: form,
  formData,
  valid,
  enhance,
} = useForm(CreateDeviceSchema, {
  onSubmit: async () => {
    if (device) {
      updateMutation.mutate({
        networkId: currentNetworkId,
        deviceId: device.id,
        deviceInfo: {
          name: $formData.name,
          ip: $formData.ip,
          ownerId: device.ownerId,
        },
      });
    } else {
      creationMutation.mutate({
        networkId: currentNetworkId,
        deviceInfo: {
          name: $formData.name,
          ip: $formData.ip,
        },
      });
    }
  },
});

onMount(() => {
  if (device) {
    $formData.name = device.name;
    $formData.ip = device.ip;
  }
});
</script>

<form method="POST" use:enhance class="space-y-4">
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
  <Form.Button disabled={!valid()} class="w-full">
    {device ? "Save Changes" : "Save Device"}
  </Form.Button>
</form>
