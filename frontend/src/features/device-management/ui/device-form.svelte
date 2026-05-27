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
import FooterButtons from "$entities/table-page/ui/FooterButtons.svelte";
import TagSelector from "$features/tag-management/ui/tag-selector.svelte";
import { networkConfig } from "$pages/app/network/[slug]/config/api/query";
import { deviceTags } from "$pages/app/network/[slug]/tags/api/query";
import { queryKeys } from "$shared/api/query-keys";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import * as ButtonGroup from "$shared/ui/button-group/index.js";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import * as InputGroup from "$shared/ui/input-group/index.js";
import * as Label from "$shared/ui/label/index.js";
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

const networkCfg = createQuery(() => networkConfig(currentNetworkId));
const userTagsQuery = createQuery(() => deviceTags.userTags(currentNetworkId));

const creationMutation = createMutation(() =>
  deviceСreationQuery(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.networkDevices(currentNetworkId),
    });
    dialogState = false;
  }),
);

const updateMutation = createMutation(() => deviceUpdateMutation(() => {}));

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
      await updateMutation.mutateAsync({
        networkId: currentNetworkId,
        deviceId: device.id,
        deviceInfo: {
          name: $formData.name,
          ip: $formData.ip,
          ownerId: device.ownerId,
          slug: $formData.slug,
        },
      });

      const tagsToRemove = device.tags.filter(
        (orig) => !deviceTagsArray.some((current) => current.id === orig.id),
      );
      const tagsToAdd = deviceTagsArray.filter(
        (current) => !device.tags.some((orig) => orig.id === current.id),
      );

      await Promise.all([
        ...tagsToRemove.map((tag) =>
          deleteTagMutation.mutateAsync({
            networkId: currentNetworkId,
            tagId: tag.id,
            deviceId: device.id,
            deviceInfo: device,
          }),
        ),
        ...tagsToAdd.map((tag) =>
          createTagMutation.mutateAsync({
            networkId: currentNetworkId,
            tagId: tag.id,
            deviceId: device.id,
            deviceInfo: device,
          }),
        ),
      ]);

      await queryClient.invalidateQueries({
        queryKey: queryKeys.network(currentNetworkId),
      });
      dialogState = false;
    } else {
      creationMutation.mutate({
        networkId: currentNetworkId,
        deviceInfo: {
          name: $formData.name,
          ip: $formData.ip,
          slug: $formData.slug,
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

<form method="POST" use:enhance class="relative">
  <Separator class="bg-border absolute -top-2 -left-4 w-124!" />
  <Form.Field {form} name="name">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label type="required">Название</Form.Label>
        <Input
          {...props}
          bind:value={$formData.name}
          placeholder="Мой ноутбук"
          oninput={() => {
            $formData.slug = slugify($formData.name, {
              lower: true,
              strict: true,
            // remove: /[\\^$|?*!"№+;:=`~.,_@/#'()\[\]{}]/g,
        }) 
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
        <Form.Label type="required">IP-адрес</Form.Label>
        <Input {...props} bind:value={$formData.ip} placeholder="10.0.0.5" />
      {/snippet}
    </Form.Control>
    <Form.Description />
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="slug">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label type="required">Slug устройства</Form.Label>
        <ButtonGroup.Root>
          <InputGroup.Root class="rounded-[6px]">
            <InputGroup.Input
              id="url"
              bind:value={$formData.slug}
              placeholder="my-laptop"
            />
            <InputGroup.Addon align="inline-end">
              <!-- <Link2Icon /> -->
            </InputGroup.Addon>
          </InputGroup.Root>
          <ButtonGroup.Text>.{networkCfg.data?.domain}</ButtonGroup.Text>
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
        <Popover.Trigger class="border-2 border-dashed px-4 rounded-[4px]">
          +
        </Popover.Trigger>
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
  <FooterButtons {valid} bind:dialogState isEditing={device !== undefined} />
</form>
