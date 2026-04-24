<script lang="ts">
import { Plus } from "@lucide/svelte";
import { createMutation, getQueryClientContext } from "@tanstack/svelte-query";
import { CreateDeviceSchema } from "common/schemas/device/create-device";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import * as Dialog from "$shared/ui/dialog/index.js";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import { deviceСreationQuery } from "../api/query";

let { open = $bindable() }: { open: boolean } = $props();
const query = createMutation(() =>
  deviceСreationQuery(() =>
    queryClient.invalidateQueries({ queryKey: ["userDevices"] }),
  ),
);
const queryClient = getQueryClientContext();
let currentNetworkId = $derived(getNetworkId().id);
let {
  forms: form,
  formData,
  valid,
  enhance,
} = useForm(CreateDeviceSchema, {
  onSubmit: async () => {
    query.mutate({
      networkId: currentNetworkId,
      deviceInfo: {
        name: $formData.name,
        ip: $formData.ip,
      },
    });
    open = false;
  },
});
</script>

<Dialog.Root bind:open>
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
      <Form.Button disabled={!valid()}>Save Device</Form.Button>
    </form>
  </Dialog.Content>
</Dialog.Root>
