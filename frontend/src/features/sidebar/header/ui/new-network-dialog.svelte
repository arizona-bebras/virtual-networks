<script lang="ts">
import { Network, Plus } from "@lucide/svelte";
import { createMutation, getQueryClientContext } from "@tanstack/svelte-query";
import { CreateNetworkSchema } from "common/schemas/network/create-network";
import { goto } from "$app/navigation";
import type { ValidationResult } from "$features/config/model/types.js";
import CidrInfo from "$features/config/ui/CidrInfo.svelte";
import CidrInput from "$features/config/ui/CidrInput.svelte";
import CidrSuggestion from "$features/config/ui/CidrSuggestion.svelte";
import { queryKeys } from "$shared/api/query-keys";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import * as Dialog from "$shared/ui/dialog/index.js";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import { Separator } from "$shared/ui/separator/index.js";
import { headerQueries } from "../api/query.js";

const queryClient = getQueryClientContext();

const query = createMutation(() =>
  headerQueries.createNetworkMutation(async (data) => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.networks(),
      exact: true,
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.networkEvents(data.id),
    });
    goto(`/app/network/${data.id}/dashboard`);
  }),
);

let { isDialogOpen = $bindable() }: { isDialogOpen: boolean } = $props();
let cidrFieldInfo: ValidationResult | null = $state(null);

let {
  forms: form,
  formData,
  valid,
  enhance,
} = useForm(CreateNetworkSchema, {
  onSubmit: async () => {
    query.mutate({
      name: $formData.name,
      description: $formData.description,
      cidr: $formData.cidr,
      domain: $formData.domain,
    });
    isDialogOpen = false;
  },
});
</script>

<Dialog.Root bind:open={isDialogOpen}>
  <Dialog.Content class="w-120 max-w-[90vw]!">
    <Dialog.Header class="flex flex-row items items-center gap-2 mb-1">
      <div class="p-2 border border-muted-foreground bg-secondary rounded-full">
        <Network class="size-6.5 stroke-secondary-foreground" />
      </div>
      <div>
        <Dialog.Title class="font-semibold">Создание сети</Dialog.Title>
        <Dialog.Description class="text-[12px]" style="line-height:normal">
          Заполните все необходимые поля, чтобы создать новую виртуальную сеть
        </Dialog.Description>
      </div>
    </Dialog.Header>
    <form method="POST" use:enhance class="relative">
      <Separator class="bg-border absolute -top-2 -left-4 w-96!" />
      <Form.Field {form} name="name">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label type="required">Название</Form.Label>
            <Input
              {...props}
              bind:value={$formData.name}
              placeholder="Моя сеть"
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field {form} name="description">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label type="required">Описание</Form.Label>
            <Input
              {...props}
              bind:value={$formData.description}
              placeholder="Сеть для второго офиса"
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field {form} name="cidr">
        <Form.Control>
          {#snippet children({ props })}
            <CidrInput bind:value={$formData.cidr} bind:info={cidrFieldInfo} />
            <CidrInfo info={cidrFieldInfo} />
            <div class="mt-1">
              <CidrSuggestion bind:cidr={$formData.cidr} />
            </div>
          <!-- <Input
              {...props}
              bind:value={$formData.cidr}
              placeholder="10.0.0.0/24"
            /> -->
          {/snippet}
        </Form.Control>

        <Form.FieldErrors />
      </Form.Field>
      <Form.Field {form} name="domain">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label type="required">Домен</Form.Label>
            <Input
              {...props}
              bind:value={$formData.domain}
              placeholder="internal"
            />
          {/snippet}
        </Form.Control>

        <Form.FieldErrors />
      </Form.Field>
      <div class="flex justify-end gap-2 mt-2 font-semibold">
        <button
          type="button"
          class="px-2.5 py-1.25 border rounded-[8px] hover:bg-accent"
          onclick={() => (isDialogOpen = false)}
        >
          Закрыть
        </button>
        <Form.Button
          disabled={!valid() || query.isPending}
          class="rounded-[8px] text-secondary-foreground"
        >
          <span>Создать</span>
        </Form.Button>
      </div>
    </form>
  </Dialog.Content>
</Dialog.Root>
