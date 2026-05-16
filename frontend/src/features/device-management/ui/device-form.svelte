<script lang="ts">
import Link2Icon from "@lucide/svelte/icons/link-2";
import {
  createMutation,
  createQuery,
  getQueryClientContext,
} from "@tanstack/svelte-query";
import { CreateDeviceSchema } from "common/schemas/device/create-device";
import type { DeviceRelations } from "common/schemas/device/index";
import slugify from "slugify";
import { untrack } from "svelte";
import { z } from "zod";
import Tags from "$entities/device/ui/device-tags-cell.svelte";
import TagSelector from "$features/tag-management/ui/tag-selector.svelte";
import { networkConfig } from "$pages/app/network/[slug]/config/api/query";
import { deviceTags } from "$pages/app/network/[slug]/tags/api/query";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import * as ButtonGroup from "$shared/ui/button-group/index.js";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import * as InputGroup from "$shared/ui/input-group/index.js";
import * as Label from "$shared/ui/label/index.js";
import * as Popover from "$shared/ui/popover/index";
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

const networkCfg = createQuery(() => networkConfig(currentNetworkId));
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

//TODO: удалить после добавления поля в схему CreateDeviceSchema
const CreateDeviceSchemaMock = CreateDeviceSchema.extend({
  slug: z.string().optional(),
});

let {
  forms: form,
  formData,
  valid,
  enhance,
} = useForm(CreateDeviceSchemaMock, {
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
    untrack(() => ($formData.slug = slugify($formData.name)));
  }
});
</script>

<form method="POST" use:enhance class="space-y-4">
  <Form.Field {form} name="name">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Name</Form.Label>
        <Input
          {...props}
          bind:value={$formData.name}
          oninput={() => {
            $formData.slug = slugify($formData.name) 
          console.log("input", slugify($formData.name))
        }}
        />
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
  <Form.Field {form} name="slug">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Device slug</Form.Label>
        <ButtonGroup.Root>
          <InputGroup.Root>
            <InputGroup.Input id="url" bind:value={$formData.slug} />
            <InputGroup.Addon align="inline-end">
              <!-- <Link2Icon /> -->
            </InputGroup.Addon>
          </InputGroup.Root>
          <!-- TODO: изменить после реализации свойства domain у сети на backend. После реализации брать домен из networkCfg -->
          <ButtonGroup.Text>.com</ButtonGroup.Text>
        </ButtonGroup.Root>
      {/snippet}
    </Form.Control>
    <Form.Description />
    <Form.FieldErrors />
  </Form.Field>

  <div class="grid w-full max-w-sm gap-6"></div>

  {#if device}
    <div class="flex gap-1 items-center">
      <Tags
        tags={deviceTagsArray}
        onclick={(name) => {
          deviceTagsArray = deviceTagsArray.filter((tag) => tag.name !== name);
        }}
      />
      <Popover.Root bind:open={isTagSelectorOpen}>
        <Popover.Trigger class="border-2 border-dashed px-4">+</Popover.Trigger>
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
  <Form.Button disabled={!valid()} class="w-full">
    {device ? "Save Changes" : "Save Device"}
  </Form.Button>
</form>
