<script lang="ts">
import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/svelte-query";
import { CreateRuleSchema } from "common/schemas/rule/create-rule";
import { ProtocolSchema, type RuleRelation } from "common/schemas/rule/index";
import { Tags } from "lucide-svelte";
import { onMount } from "svelte";
import SuperDebug from "sveltekit-superforms";
import { z } from "zod";
import TagBadge from "$entities/tag/ui/tag-badge.svelte";
import { deviceTags } from "$pages/app/network/[slug]/tags/api/query";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import * as Select from "$shared/ui/select/index";
import { ruleCreationMutation, ruleUpdateMutation } from "../api/query";

let {
  pageData,
  dialogState = $bindable(),
}: { pageData?: RuleRelation; dialogState: boolean } = $props();

let currentNetworkId = $derived(getNetworkId().id);
const userTags = createQuery(() => deviceTags.userTags(currentNetworkId));

let protocolOptions = ProtocolSchema.options;

const queryClient = useQueryClient();

const createMutationQuery = createMutation(() =>
  ruleCreationMutation(() => {
    queryClient.invalidateQueries({
      queryKey: ["userRules", currentNetworkId],
    }),
      (dialogState = false);
  }),
);

const updateMutationQuery = createMutation(() =>
  ruleUpdateMutation(() => {
    queryClient.invalidateQueries({
      queryKey: ["userRules", currentNetworkId],
    }),
      (dialogState = false);
  }),
);

let selectedSourceTag = $derived(
  userTags.data?.find((tag) => tag.id === $formData.sourceId),
);
let selectedDestTag = $derived(
  userTags.data?.find((tag) => tag.id === $formData.destId),
);

let {
  forms: form,
  formData,
  valid,
  enhance,
  errors,
} = useForm(CreateRuleSchema, {
  onSubmit: async () => {
    console.log("Adding new rule:", $formData);
    console.log("Errors:", $errors._errors);
    if (pageData)
      updateMutationQuery.mutate({
        networkId: currentNetworkId,
        ruleId: pageData.id,
        ruleInfo: $formData,
      });
    else
      createMutationQuery.mutate({
        networkId: currentNetworkId,
        ruleInfo: $formData,
      });
    // open = false;
  },
});

onMount(() => {
  if (pageData) {
    console.log(pageData);
    $formData.description = pageData?.description;
    $formData.sourceId = pageData?.sourceId;
    $formData.destId = pageData?.destId;
    $formData.protocol = pageData?.protocol;
    $formData.port = Number(pageData?.port) || null;
  }
});
</script>

<form method="POST" use:enhance class="space-y-4">
  <Form.Field {form} name="description">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Description</Form.Label>
        <Input
          {...props}
          bind:value={$formData.description}
          placeholder="Allow SSH"
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <div class="grid grid-cols-2 gap-4">
    <Form.Field {form} name="sourceId">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Source Tag</Form.Label>
          <Select.Root type="single" bind:value={$formData.sourceId!}>
            <Select.Trigger class="w-[180px] flex">
              {#if $formData.sourceId && selectedSourceTag}
                <TagBadge tag={selectedSourceTag} />
              {:else}
                <span>Выберите тег</span>
              {/if}
            </Select.Trigger>
            <Select.Content>
              {#each userTags.data as tag (tag.id)}
                <Select.Item value={tag.id}><TagBadge {tag} /></Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="destId">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Destination Tag</Form.Label>
          <Select.Root type="single" bind:value={$formData.destId!}>
            <Select.Trigger class="w-[180px] flex">
              {#if $formData.destId && selectedDestTag}
                <TagBadge tag={selectedDestTag} />
              {:else}
                <span>Выберите тег</span>
              {/if}
            </Select.Trigger>
            <Select.Content>
              {#each userTags.data as tag (tag.id)}
                <Select.Item value={tag.id}><TagBadge {tag} /></Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
  </div>

  <div class="grid grid-cols-2 gap-4">
    <Form.Field {form} name="protocol">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Protocol</Form.Label>
          <Select.Root type="single" bind:value={$formData.protocol!}>
            <Select.Trigger class="w-[180px]">
              {$formData.protocol ? $formData.protocol : 'Выберите протокол'}
            </Select.Trigger>
            <Select.Content>
              {#each protocolOptions as protocol (protocol)}
                <Select.Item value={protocol}>{protocol}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="port">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Port</Form.Label>
          <Input
            {...props}
            value={$formData.port}
            oninput={(e) => $formData.port = Number(e.currentTarget.value)}
            placeholder="22"
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
  </div>
  <Form.Button class="w-full" disabled={!valid()}>
    {pageData ? 'Update Rule' :'Create Rule'}
  </Form.Button>
  {#if import.meta.env.DEV}
    <SuperDebug data={$formData} />
  {/if}
</form>
