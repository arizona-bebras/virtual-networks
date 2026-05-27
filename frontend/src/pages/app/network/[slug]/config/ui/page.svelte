<script lang="ts">
import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/svelte-query";
import { UpdateNetworkSchema } from "common/schemas/network/update-network";
import { untrack } from "svelte";
import { z } from "zod";
import { goto } from "$app/navigation";
import type { ValidationResult } from "$features/config/model/types";
import CidrInput from "$features/config/ui/CidrInput.svelte";
import CidrSuggestion from "$features/config/ui/CidrSuggestion.svelte";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import * as Card from "$shared/ui/card/index.js";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import { Separator } from "$shared/ui/separator/index.js";
import {
  networkConfig,
  networkDeletionMutation,
  networkUpdateMutation,
} from "../api/query";

const queryClient = useQueryClient();
let networkId = $derived(getNetworkId().id);
let networkCfg = createQuery(() => networkConfig(networkId));
let cidrFieldInfo: ValidationResult | null = $state(null);

const updateMutation = createMutation(() =>
  networkUpdateMutation(() => {
    queryClient.invalidateQueries({ queryKey: ["networkConfig", networkId] });
    queryClient.invalidateQueries({ queryKey: ["userNetworks"] });
  }),
);

const deleteMutation = createMutation(() =>
  networkDeletionMutation(() => {
    queryClient.invalidateQueries({ queryKey: ["networkConfig", networkId] });
    queryClient.invalidateQueries({ queryKey: ["userNetworks"] });
    goto("/app");
  }),
);

let {
  forms: form,
  formData,
  valid,
  enhance,
} = useForm(UpdateNetworkSchema, {
  resetForm: false,
  onSubmit: async () => {
    updateMutation.mutate({
      networkId,
      networkInfo: {
        name: $formData.name,
        cidr: $formData.cidr,
        description: $formData.description,
        domain: $formData.domain,
      },
    });
  },
});

$effect(() => {
  if (networkCfg.isSuccess) {
    untrack(() => {
      $formData.name = networkCfg?.data?.name;
      $formData.cidr = networkCfg?.data?.cidr ?? "";
      $formData.description = networkCfg?.data?.description;
      $formData.domain = networkCfg?.data?.domain ?? "internal";
    });
  }
});

function handleDelete() {
  if (
    confirm(
      "Вы уверены, что хотите удалить эту сеть? Это действие нельзя отменить.",
    )
  ) {
    deleteMutation.mutate(networkId);
  }
}
</script>

{#if networkCfg.isSuccess}
  <div class="mx-auto max-w-2xl p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight">Конфигурация сети</h1>
      <p class="text-muted-foreground">
        Настройте параметры вашей виртуальной сети.
      </p>
    </div>

    <Card.Root>
      <Card.Header>
        <Card.Title>Общие настройки</Card.Title>
        <Card.Description>
          Обновите название вашей сети и адресное пространство.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <form method="POST" use:enhance class="space-y-6">
          <Form.Field {form} name="name">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label>Название сети</Form.Label>
                <Input
                  {...props}
                  bind:value={$formData.name}
                  placeholder="Моя сеть"
                />
              {/snippet}
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>

          <!-- <Form.Field {form} name="cidr">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Network CIDR</Form.Label>
              <Input {...props} bind:value={$formData.cidr} />
              <p class="mt-1 text-xs text-muted-foreground">
                The IP range for this network (e.g. 10.0.0.0/24).
              </p>
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field> -->
          <div class="">
            {#if $formData.cidr}
              <CidrInput
                bind:value={$formData.cidr}
                bind:info={cidrFieldInfo}
              />
              {#if cidrFieldInfo}
                {#if cidrFieldInfo?.isValid}
                  <p>
                    Диапазон хостов: {cidrFieldInfo.firstHost} - {cidrFieldInfo.lastHost}
                  </p>
                  <p>Размер сети: {cidrFieldInfo.hostCount}</p>
                {:else}
                  {@const error = cidrFieldInfo.error}
                  <p class="text-sm font-medium text-destructive">
                    Ближайшие цифры {error.suggestion.lower}
                    {error.suggestion.upper === -1 ? '' : `и ${error.suggestion.upper}`}
                  </p>
                {/if}
              {/if}
              <div class="mt-1">
                <CidrSuggestion bind:cidr={$formData.cidr} />
              </div>
            {/if}
          </div>

          <Form.Field {form} name="description">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label>Описание</Form.Label>
                <Input
                  {...props}
                  bind:value={$formData.description}
                  placeholder="Сеть для домашних устройств"
                />
              {/snippet}
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>

          <Form.Field {form} name="domain">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label>Домен</Form.Label>
                <Input
                  {...props}
                  bind:value={$formData.domain}
                  placeholder="internal"
                />
              {/snippet}
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>

          <Separator />

          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium">ID сети</span>
            <span
              class="rounded bg-muted p-2 text-xs font-mono text-muted-foreground"
            >
              {networkId}
            </span>
          </div>
          <div class="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={!valid()}>
              Сохранить изменения
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card.Root>

    <div class="mt-8">
      <Card.Root class="border-destructive/20 bg-destructive/5">
        <Card.Header>
          <Card.Title class="text-destructive">Опасная зона</Card.Title>
          <Card.Description>
            Навсегда удалить эту сеть и все связанные данные.
          </Card.Description>
        </Card.Header>
        <Card.Footer>
          <Button variant="destructive" onclick={handleDelete}>
            Удалить сеть
          </Button>
        </Card.Footer>
      </Card.Root>
    </div>
  </div>
{/if}
