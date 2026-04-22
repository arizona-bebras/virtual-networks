<script lang="ts">
import { Plus } from "@lucide/svelte";
import { createMutation } from "@tanstack/svelte-query";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { Button } from "$shared/ui/button/index.js";
import * as Dialog from "$shared/ui/dialog/index.js";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import { Label } from "$shared/ui/label/index.js";
import { deviceСreationQuery } from "../api/query";
import { formSchema } from "../model/add-device-btn";

let { open = $bindable() }: { open: boolean } = $props();
const query = createMutation(() => deviceСreationQuery());
let {
  forms: form,
  formData,
  valid,
  enhance,
} = useForm(formSchema, {
  onSubmit: async () => {
    query.mutate({
      networkId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      deviceInfo: {
        name: $formData.name,
        ip: "12.2.2.12",
        config: "proto udp\nport 1194\n...",
        network_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      },
      //   name: $formData.name,
      //   description: $formData.description,
      //   ip: cidrParts[0]!,
      //   subnet: parseInt(cidrParts[1]!, 10),
      //   config: "proto udp\nport 1194\n...",
      //   adminId: "B8osnmhFISBu6B7I0wAJsmGEmSOxWNam",
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
      <Form.Button>Save Device</Form.Button>
    </form>
    <!-- <div class="grid gap-2 py-4">
      <div class="grid gap-1">
        <Label for="name">Name</Label>
        <Input
          id="name"
          bind:value={newDeviceData.name}
          placeholder="My Device"
        />
      </div>
    </div> -->
  </Dialog.Content>
</Dialog.Root>
