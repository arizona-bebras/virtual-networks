<script lang="ts">
import {
  createMutation,
  createQuery,
  getQueryClientContext,
} from "@tanstack/svelte-query";
import { CreateDeviceSchema } from "common/schemas/device/create-device";
import type { DeviceRelations } from "common/schemas/device/index";
import { onMount } from "svelte";
import Tags from "$entities/device/ui/device-tags-cell.svelte";
import { tagCreationMutation } from "$features/tag-management/api/query";
import TagSelector from "$features/tag-management/ui/teg-selector.svelte";
import { deviceTags } from "$pages/app/network/[slug]/tags/api/query";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import * as Popover from "$shared/ui/popover/index";
import {
  deviceUpdateMutation,
  deviceСreationQuery,
  tagDeviceCreation,
} from "../api/query";

let {
  device,
  dialogState = $bindable(),
}: { device?: DeviceRelations; dialogState: boolean } = $props();

const queryClient = getQueryClientContext();
let currentNetworkId = $derived(getNetworkId().id);

const userTagsQuery = createQuery(() => deviceTags.userTags(currentNetworkId));
const networkTagsQuery = createQuery(() =>
  deviceTags.userTags(currentNetworkId, ""),
);

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

const createTagMutation = createMutation(() =>
  tagDeviceCreation(() => {
    queryClient.invalidateQueries({ queryKey: ["userDevices"] });
    dialogState = false;
  }),
);

let selectedTagName = $state("");
let selectedTag = $derived(
  userTagsQuery.data?.filter((tag) => tag.name === selectedTagName),
);
let isTagSelectorOpen = $state(false);
let arrayTest = $state(device?.tags);
let removedElements: DeviceRelations["tags"] = $state([]);

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
      console.log(device.tags, arrayTest);
      for (const tag of arrayTest!.slice(device.tags.length)) {
        createTagMutation.mutate({
          networkId: currentNetworkId,
          tagId: tag?.id,
          deviceId: device.id,
          deviceInfo: device,
        });
      }
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
  {#if device}
    <div class="flex gap-1 items-center">
      <Tags
        tags={arrayTest}
        onclick={(name) => {
          const removedElement = arrayTest!.filter((tag) => tag.name === name)
          // arrayTest = arrayTest?.filter((tag) => tag.name !== name)

          if (device.tags.some((tag) => tag.id === removedElement[0]?.id)){
            console.log("Этот элемент есть в исходном массиве", device.tags, remove)
          }
        }}
      />
      <Popover.Root bind:open={isTagSelectorOpen}>
        <Popover.Trigger class="border-2 border-dashed px-4">+</Popover.Trigger>
        <Popover.Content>
          <TagSelector
            onclick={(name) => {
            selectedTagName = name
            arrayTest.push(selectedTag[0])
          }}
            excludedTags={arrayTest}
          />
        </Popover.Content>
      </Popover.Root>
    </div>
  {/if}
  <Form.Button disabled={!valid()} class="w-full">
    {device ? "Save Changes" : "Save Device"}
  </Form.Button>
</form>
