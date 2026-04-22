<script lang="ts">
import { Plus } from "@lucide/svelte";
import { createMutation } from "@tanstack/svelte-query";
import { CreateTagSchema } from "common/schemas/tag/create-tag";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { Button } from "$shared/ui/button/index.js";
import * as Dialog from "$shared/ui/dialog/index.js";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import { Label } from "$shared/ui/label/index.js";
import { deviceСreationQuery } from "../api/query";

let { open = $bindable() }: { open: boolean } = $props();
const query = createMutation(() => deviceСreationQuery());
const colors = [
  { name: "Red", value: "bg-red-500", key: "red" },
  { name: "Green", value: "bg-green-500", key: "green" },
  { name: "Blue", value: "bg-blue-500", key: "blue" },
  { name: "Yellow", value: "bg-yellow-500", key: "yellow" },
  { name: "Purple", value: "bg-purple-500", key: "purple" },
  { name: "Orange", value: "bg-orange-500", key: "orange" },
] as const;
let {
  forms: form,
  formData,
  valid,
  enhance,
} = useForm(CreateTagSchema, {
  onSubmit: async () => {
    query.mutate({
      networkId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      tagInfo: {
        name: $formData.name,
        color: $formData.color,
        // icon: $formData.icon,
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
      Add Tag
    </Button>
  </Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Add Tag</Dialog.Title>
      <Dialog.Description>
        Create a new tag to group your devices.
      </Dialog.Description>
    </Dialog.Header>
    <!-- <div class="grid gap-2 py-4">
      <div class="grid gap-1">
        <Label for="name">Name</Label>
        <Input
          id="name"
          bind:value={$formData}
          placeholder="e.g. Servers"
        />
      </div>
      <div class="grid gap-1">
        <Label>Color</Label>
        <div class="flex gap-2">
          {#each colors as color}
            <button
              type="button"
              class={`size-6 rounded-full ${color.value} ring-primary ring-offset-2 ring-offset-background transition-all hover:ring-2 ${newTagData.color === color.key ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              title={color.name}
              onclick={() => $formData.color = color.key}
            ></button>
          {/each}
        </div>
      </div>
      <div class="grid gap-1">
        <Label for="icon">Icon Name</Label>
        <Input
          id="icon"
          bind:value={newTagData.icon}
          placeholder="e.g. Server, Database"
        />
      </div>
    </div> -->
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
      <Form.Field {form} name="color">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Color</Form.Label>
            <div class="flex gap-2">
              {#each colors as color}
                <button
                  type="button"
                  class={`size-6 rounded-full ${color.value} ring-primary ring-offset-2 ring-offset-background transition-all hover:ring-2 ${$formData.color === color.key ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  title={color.name}
                  onclick={() => $formData.color = color.key}
                ></button>
              {/each}
            </div>
          {/snippet}
        </Form.Control>
        <Form.Description />
        <Form.FieldErrors />
      </Form.Field>
      <Form.Button>Save Tag</Form.Button>
    </form>
    <!-- <Dialog.Footer>
      <Button type="button" onclick={addTag}>Save Tag</Button>
    </Dialog.Footer> -->
  </Dialog.Content>
</Dialog.Root>
