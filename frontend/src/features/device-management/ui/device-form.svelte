<script lang="ts">
import {
  createMutation,
  createQuery,
  getQueryClientContext,
} from "@tanstack/svelte-query";
import { CreateDeviceSchema } from "common/schemas/device/create-device";
import type { DeviceRelations } from "common/schemas/device/index";
import Tags from "$entities/device/ui/device-tags-cell.svelte";
import TagSelector from "$features/tag-management/ui/tag-selector.svelte";
import { deviceTags } from "$pages/app/network/[slug]/tags/api/query";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import * as Popover from "$shared/ui/popover/index";
import { Separator } from "$shared/ui/separator/index";
import {
  deviceUpdateMutation,
  deviceСreationQuery,
  tagDeviceCreation,
  tagDeviceRemove,
} from "../api/query";

let {
  device,
  dialogState = $bindable(),
}: { device?: DeviceRelations; dialogState: boolean } = $props();

const queryClient = getQueryClientContext();
let currentNetworkId = $derived(getNetworkId().id);

const userTagsQuery = createQuery(() => deviceTags.userTags(currentNetworkId));

const creationMutation = createMutation(() =>
  deviceСreationQuery(() => {
    queryClient.invalidateQueries({
      queryKey: ["userDevices", currentNetworkId],
    });
    dialogState = false;
  }),
);

const updateMutation = createMutation(() =>
  deviceUpdateMutation(() => {
    queryClient.invalidateQueries({
      queryKey: ["userDevices", currentNetworkId],
    });
    dialogState = false;
  }),
);

const createTagMutation = createMutation(() => tagDeviceCreation(() => {}));

const deleteTagMutation = createMutation(() => tagDeviceRemove(() => {}));

let isTagSelectorOpen = $state(false);
// svelte-ignore state_referenced_locally
let deviceTagsArray = $state(device?.tags || []);

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

      const tagsToRemove = device.tags.filter(
        (orig) => !deviceTagsArray.some((current) => current.id === orig.id),
      );
      const tagsToAdd = deviceTagsArray.filter(
        (current) => !device.tags.some((orig) => orig.id === current.id),
      );

      for (const tag of tagsToRemove) {
        deleteTagMutation.mutate({
          networkId: currentNetworkId,
          tagId: tag.id,
          deviceId: device.id,
          deviceInfo: device,
        });
      }
      for (const tag of tagsToAdd) {
        createTagMutation.mutate({
          networkId: currentNetworkId,
          tagId: tag.id,
          deviceId: device.id,
          deviceInfo: device,
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["userDevices", currentNetworkId],
      });
      queryClient.invalidateQueries({
        queryKey: ["userTags", currentNetworkId],
      });
      dialogState = false;
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

$effect(() => {
  if (device) {
    $formData.name = device.name;
    $formData.ip = device.ip;
  }
});
</script>

<form method="POST" use:enhance class="relative">
  <Separator class="bg-border absolute -top-2 -left-4 w-124!" />
  <Form.Field {form} name="name">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label type="required">Название</Form.Label>
        <Input {...props} bind:value={$formData.name} />
      {/snippet}
    </Form.Control>
    <Form.Description />
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="ip">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label type="required">IP-адрес</Form.Label>
        <Input {...props} bind:value={$formData.ip} />
      {/snippet}
    </Form.Control>
    <Form.Description />
    <Form.FieldErrors />
  </Form.Field>
  {#if device}
    <div class="flex gap-1 items-center">
      <Tags
        tags={deviceTagsArray}
        onclick={(name) => {
          deviceTagsArray = deviceTagsArray.filter((tag) => tag.name !== name);
        }}
      />
      <Popover.Root bind:open={isTagSelectorOpen}>
        <Popover.Trigger class="border-2 border-dashed px-4 rounded-[4px]">+</Popover.Trigger>
        <Popover.Content>
          <TagSelector
            onclick={(name) => {
            const tag = userTagsQuery.data?.find((t) => t.name === name);
            if (tag){
              deviceTagsArray.push(tag);
            }
          }}
            excludedTags={deviceTagsArray}
          />
        </Popover.Content>
      </Popover.Root>
    </div>
  {/if}
  <div class="flex justify-end gap-2 mt-2 font-semibold">
    <button
      type="button"
      class="px-2.5 py-1.25 border rounded-[8px] hover:bg-accent"
      onclick={() => (dialogState = false)}
    >
      Закрыть
    </button>
    <Form.Button
      disabled={!valid()}
      class="rounded-[8px] text-secondary-foreground"
    >
      <span>{device ? "Сохранить" : "Создать"}</span>
    </Form.Button>
  </div>
</form>
