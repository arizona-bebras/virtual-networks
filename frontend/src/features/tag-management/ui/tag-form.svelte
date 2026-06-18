<script lang="ts">
import { createMutation, getQueryClientContext } from "@tanstack/svelte-query";
import { CreateTagSchema } from "common/schemas/tag/create-tag";
import type { Tag } from "common/schemas/tag/index";
import FooterButtons from "$entities/table-page/ui/FooterButtons.svelte";
import { queryKeys } from "$shared/api/query-keys";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import { Separator } from "$shared/ui/separator/index";
import { tagCreationMutation, tagUpdateMutation } from "../api/query";

let {
  tag,
  dialogState = $bindable(),
  oncreate,
}: { tag?: Tag; dialogState: boolean; oncreate?: (tag: Tag) => void } =
  $props();

const queryClient = getQueryClientContext();
let currentNetworkId = $derived(getNetworkId().id);

const colors = [
  { name: "Red", value: "bg-red-500", key: "red" },
  { name: "Green", value: "bg-green-500", key: "green" },
  { name: "Blue", value: "bg-blue-500", key: "blue" },
  { name: "Yellow", value: "bg-yellow-500", key: "yellow" },
  { name: "Purple", value: "bg-purple-500", key: "purple" },
  { name: "Orange", value: "bg-orange-500", key: "orange" },
] as const;

const creationMutation = createMutation(() =>
  tagCreationMutation((created) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.networkTags(currentNetworkId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.networkEvents(currentNetworkId),
    });
    dialogState = false;
    if (created) oncreate?.(created);
  }),
);

const updateMutation = createMutation(() =>
  tagUpdateMutation(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.network(currentNetworkId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.networkEvents(currentNetworkId),
    });
    dialogState = false;
  }),
);

let {
  forms: form,
  formData,
  valid,
  enhance,
} = useForm(CreateTagSchema, {
  onSubmit: async () => {
    if (tag) {
      updateMutation.mutate({
        networkId: currentNetworkId,
        tagId: tag.id,
        tagInfo: {
          name: $formData.name,
          color: $formData.color,
        },
      });
    } else {
      creationMutation.mutate({
        networkId: currentNetworkId,
        tagInfo: {
          name: $formData.name,
          color: $formData.color,
        },
      });
    }
  },
});

$effect(() => {
  if (tag) {
    $formData.name = tag.name;
    $formData.color = tag.color;
  }
});
</script>

<form method="POST" use:enhance class="relative">
  <Separator class="bg-border absolute -top-2 -left-4 w-124!" />
  <Form.Field {form} name="name">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Название</Form.Label>
        <Input {...props} bind:value={$formData.name} placeholder="Серверы" />
      {/snippet}
    </Form.Control>
    <Form.Description />
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="color">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Цвет</Form.Label>
        <div class="flex gap-2">
          {#each colors as color}
            {@const isSelected = $formData.color === color.key}
            <button
              type="button"
              class={`size-6 rounded-full ${color.value} transition-all hover:ring-1! ${isSelected ? 'ring-2 ring-secondary' : ''}`}
              title={color.name}
              onclick={() => $formData.color = color.key}
            >
              <!-- {#if isSelected}
                <span class="text-background">✔</span>
              {/if} -->
            </button>
          {/each}
        </div>
      {/snippet}
    </Form.Control>
    <Form.Description />
    <Form.FieldErrors />
  </Form.Field>
  <FooterButtons {valid} bind:dialogState isEditing={tag !== undefined} />
</form>
