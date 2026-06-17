<script lang="ts">
import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/svelte-query";
import { CreateRuleSchema } from "common/schemas/rule/create-rule";
import { ProtocolSchema, type RuleRelation } from "common/schemas/rule/index";
import SuperDebug from "sveltekit-superforms";
import FooterButtons from "$entities/table-page/ui/FooterButtons.svelte";
import TagBadge from "$entities/tag/ui/tag-badge.svelte";
import TagListItem from "$entities/tag/ui/tag-list-item.svelte";
import { deviceTags } from "$pages/app/network/[slug]/tags/api/query";
import { queryKeys } from "$shared/api/query-keys";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import * as Select from "$shared/ui/select/index";
import { Separator } from "$shared/ui/separator/index";
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
      queryKey: queryKeys.networkRules(currentNetworkId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.networkEvents(currentNetworkId),
    });
    dialogState = false;
  }),
);

const updateMutationQuery = createMutation(() =>
  ruleUpdateMutation(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.networkRules(currentNetworkId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.networkEvents(currentNetworkId),
    });
    dialogState = false;
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

$effect(() => {
  if (pageData) {
    $formData.description = pageData?.description;
    $formData.sourceId = pageData?.sourceId;
    $formData.destId = pageData?.destId;
    $formData.protocol = pageData?.protocol;
    $formData.port = Number(pageData?.port) || null;
  }
});
</script>

<form method="POST" use:enhance class="relative">
  <Separator class="bg-border absolute -top-2 -left-4 w-106!" />
  <Form.Field {form} name="description">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label type="required">Описание</Form.Label>
        <Input
          {...props}
          bind:value={$formData.description}
          placeholder="Разрешить SSH"
        />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <div class="grid grid-cols-2 gap-4">
    <Form.Field {form} name="sourceId">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Тег источника</Form.Label>
          <Select.Root type="single" bind:value={$formData.sourceId!}>
            <Select.Trigger class="w-[180px] flex">
              {#if $formData.sourceId && selectedSourceTag}
                <TagListItem
                  name={selectedSourceTag.name}
                  color={selectedSourceTag.color}
                />
              {:else}
                <span>Любой</span>
              {/if}
            </Select.Trigger>
            <Select.Content>
              {#each userTags.data as tag (tag.id)}
                <Select.Item value={tag.id}>
                  <TagListItem name={tag.name} color={tag.color} />
                </Select.Item>
              {/each}
              <Select.Item value="" onclick={() => $formData.sourceId = null}>
                Любой
              </Select.Item>
            </Select.Content>
          </Select.Root>
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="destId">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Тег назначения</Form.Label>
          <Select.Root type="single" bind:value={$formData.destId!}>
            <Select.Trigger class="w-[180px] flex">
              {#if $formData.destId && selectedDestTag}
                <TagListItem
                  name={selectedDestTag.name}
                  color={selectedDestTag.color}
                />
              {:else}
                <span>Любой</span>
              {/if}
            </Select.Trigger>
            <Select.Content>
              {#each userTags.data as tag (tag.id)}
                <Select.Item value={tag.id}>
                  <TagListItem name={tag.name} color={tag.color} />
                </Select.Item>
              {/each}
              <Select.Item value="" onclick={() => $formData.destId = null}>
                Любой
              </Select.Item>
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
          <Form.Label>Протокол</Form.Label>
          <Select.Root
            type="single"
            bind:value={$formData.protocol!}
            onValueChange={(value: string) => { 
              if (!['TCP', 'UDP'].includes(value)) $formData.port = null
          }}
          >
            <Select.Trigger class="w-[180px]">
              {$formData.protocol ? $formData.protocol : 'Любой'}
            </Select.Trigger>
            <Select.Content>
              {#each protocolOptions as protocol (protocol)}
                <Select.Item value={protocol}>{protocol}</Select.Item>
              {/each}
              <Select.Item value="" onclick={() => $formData.protocol = null}>
                Любой
              </Select.Item>
            </Select.Content>
          </Select.Root>
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="port">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Порт</Form.Label>
          <Input
            {...props}
            bind:value={$formData.port}
            type="number"
            placeholder="22"
            disabled={!['TCP', 'UDP'].includes($formData.protocol ?? "")}
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
  </div>
  <FooterButtons {valid} bind:dialogState isEditing={pageData !== undefined} />
  {#if import.meta.env.DEV}
    <SuperDebug data={$formData} />
  {/if}
</form>
