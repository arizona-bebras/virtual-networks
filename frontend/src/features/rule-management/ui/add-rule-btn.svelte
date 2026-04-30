<script lang="ts">
import { Plus } from "@lucide/svelte";
import { createQuery } from "@tanstack/svelte-query";
import { CreateRuleSchema } from "common/schemas/rule/create-rule";
import SuperDebug from "sveltekit-superforms";
import { z } from "zod";
import { deviceTags } from "$pages/app/network/[slug]/tags/api/query";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import * as Dialog from "$shared/ui/dialog/index.js";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import * as Select from "$shared/ui/select/index";

let { open = $bindable() }: { open: boolean } = $props();

// TODO: Убрать после изменения формы на backend
const ExtendedCreateRuleSchema = CreateRuleSchema.extend({
  description: z.string().min(1, "Description is required"),
});

// TODO: Убрать после изменения формы на backend
export const ProtocolSchema = z.enum([
  "TCP",
  "UDP",
  "ICMP",
  "SCTP",
  "DCCP",
  "UDP-Lite",
  "AH",
  "ESP",
]);

// TODO: Убрать после изменения формы на backend
export const protocolOptions = ProtocolSchema.options.map((protocol) => ({
  value: protocol,
  label: protocol,
}));

const protocolDisplayingValue = $derived(
  protocolOptions.find((f) => f.value === $formData.protocol)?.label ??
    "Выберите протокол",
);
let currentNetworkId = $derived(getNetworkId().id);
const userTags = createQuery(() => deviceTags.userTags(currentNetworkId));

let {
  forms: form,
  formData,
  valid,
  enhance,
} = useForm(ExtendedCreateRuleSchema, {
  onSubmit: async () => {
    console.log("Adding new rule:", $formData);
    open = false;
  },
});
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    <Button>
      <Plus class="mr-2 size-4" />
      Add Rule
    </Button>
  </Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Add Rule</Dialog.Title>
      <Dialog.Description>
        Create a new network access control rule.
      </Dialog.Description>
    </Dialog.Header>
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
        <Form.Field {form} name="source">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Source Tag</Form.Label>
              <Select.Root type="single" bind:value={$formData.source}>
                <Select.Trigger class="w-[180px]">
                  {$formData.source ? $formData.source : 'Выберите тег'}
                </Select.Trigger>
                <Select.Content>
                  {#each userTags.data as tag (tag.id)}
                    <Select.Item value={tag.name}>
                      <!-- TODO: Изменить после marge всех веток, если сделать сейчас будет конфликт -->
                      <div class="size-2 rounded-full bg-green-500"></div>
                      <p>{tag.name}</p>
                    </Select.Item>
                  {/each}
                </Select.Content>
              </Select.Root>
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field {form} name="dest">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Destination Tag</Form.Label>
              <Select.Root type="single" bind:value={$formData.dest}>
                <Select.Trigger class="w-[180px]">
                  {$formData.dest ? $formData.dest : 'Выберите протокол'}
                </Select.Trigger>
                <Select.Content>
                  {#each userTags.data as tag (tag.id)}
                    <Select.Item value={tag.name}>
                      <!-- TODO: Изменить после marge всех веток, если сделать сейчас будет конфликт -->
                      <div class="size-2 rounded-full bg-green-500"></div>
                      <p>{tag.name}</p>
                    </Select.Item>
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
              <Select.Root type="single" bind:value={$formData.protocol}>
                <Select.Trigger class="w-[180px]">
                  {$formData.protocol ? $formData.protocol : 'Выберите протокол'}
                </Select.Trigger>
                <Select.Content>
                  {#each protocolOptions as protocol (protocol.value)}
                    <Select.Item value={protocol.value}>
                      {protocol.label}
                    </Select.Item>
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
                type="number"
                value={$formData.port}
                oninput={(e) => $formData.port = Number(e.currentTarget.value)}
                placeholder="22"
              />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
      </div>

      <Form.Button class="w-full" disabled={!valid()}>Create Rule</Form.Button>
    </form>
  </Dialog.Content>
</Dialog.Root>
