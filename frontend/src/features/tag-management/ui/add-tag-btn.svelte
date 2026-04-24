<script lang="ts">
import { Plus } from "@lucide/svelte";
import { createMutation, getQueryClientContext } from "@tanstack/svelte-query";
import { CreateTagSchema } from "common/schemas/tag/create-tag";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import * as Dialog from "$shared/ui/dialog/index.js";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import { tagCreationMutation } from "../api/query";

let { open = $bindable() }: { open: boolean } = $props();

const queryClient = getQueryClientContext();
const query = createMutation(() =>
  tagCreationMutation(() =>
    queryClient.invalidateQueries({ queryKey: ["userTags"] }),
  ),
);

const colors = [
  { name: "Red", value: "bg-red-500", key: "red" },
  { name: "Green", value: "bg-green-500", key: "green" },
  { name: "Blue", value: "bg-blue-500", key: "blue" },
  { name: "Yellow", value: "bg-yellow-500", key: "yellow" },
  { name: "Purple", value: "bg-purple-500", key: "purple" },
  { name: "Orange", value: "bg-orange-500", key: "orange" },
] as const;

let currentNetworkId = $derived(getNetworkId().id);

let {
  forms: form,
  formData,
  valid,
  enhance,
} = useForm(CreateTagSchema, {
  onSubmit: async () => {
    query.mutate({
      networkId: currentNetworkId,
      tagInfo: {
        name: $formData.name,
        color: $formData.color,
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
    <form method="POST" use:enhance>
      <Form.Field {form} name="name">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Name</Form.Label>
            <Input {...props} bind:value={$formData.name} placeholder="e.g. Servers" />
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
      <Form.Button disabled={!valid()}>Save Tag</Form.Button>
    </form>
  </Dialog.Content>
</Dialog.Root>
