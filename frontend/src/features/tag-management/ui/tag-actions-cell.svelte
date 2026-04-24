<script lang="ts">
import { Edit, MoreHorizontal, Trash } from "@lucide/svelte";
import { createMutation, getQueryClientContext } from "@tanstack/svelte-query";
import { Tag } from "common/schemas/tag/index";
import { UpdateTagSchema } from "common/schemas/tag/update-tag";
import { untrack } from "svelte";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import * as Dialog from "$shared/ui/dialog/index.js";
import * as DropdownMenu from "$shared/ui/dropdown-menu/index.js";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import { tagDeletionMutation, tagUpdateMutation } from "../api/query";

let { tag }: { tag: Tag } = $props();

const queryClient = getQueryClientContext();
let isEditDialogOpen = $state(false);
let currentNetworkId = $derived(getNetworkId().id);

const colors = [
  { name: "Red", value: "bg-red-500", key: "red" },
  { name: "Green", value: "bg-green-500", key: "green" },
  { name: "Blue", value: "bg-blue-500", key: "blue" },
  { name: "Yellow", value: "bg-yellow-500", key: "yellow" },
  { name: "Purple", value: "bg-purple-500", key: "purple" },
  { name: "Orange", value: "bg-orange-500", key: "orange" },
] as const;

const updateMutation = createMutation(() =>
  tagUpdateMutation(() => {
    queryClient.invalidateQueries({ queryKey: ["userTags"] });
    isEditDialogOpen = false;
  }),
);

const deleteMutation = createMutation(() =>
  tagDeletionMutation(() => {
    queryClient.invalidateQueries({ queryKey: ["userTags"] });
  }),
);

let {
  forms: form,
  formData,
  valid,
  enhance,
} = useForm(UpdateTagSchema, {
  onSubmit: async () => {
    updateMutation.mutate({
      networkId: currentNetworkId,
      tagId: tag.id,
      tagInfo: {
        name: $formData.name,
        color: $formData.color,
      },
    });
    isEditDialogOpen = false;
  },
});

$effect(() => {
  if (isEditDialogOpen) {
    untrack(() => {
      $formData.name = tag.name;
      $formData.color = tag.color;
    });
  }
});

function handleDelete() {
  deleteMutation.mutate({
    networkId: currentNetworkId,
    tagId: tag.id,
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
        Edit Tag
      </DropdownMenu.Item>
      <DropdownMenu.Item class="text-destructive" onclick={handleDelete}>
        <Trash class="mr-2 size-4" />
        Delete Tag
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>

<Dialog.Root bind:open={isEditDialogOpen}>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Edit Tag</Dialog.Title>
      <Dialog.Description>Update the details for your tag.</Dialog.Description>
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
      <Form.Button disabled={!valid()} type="submit">Save Changes</Form.Button>
    </form>
  </Dialog.Content>
</Dialog.Root>
