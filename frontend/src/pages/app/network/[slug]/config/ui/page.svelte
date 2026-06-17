<script lang="ts">
import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/svelte-query";
import { UpdateNetworkSchema } from "common/schemas/network/update-network";
import { Save, TriangleAlert } from "lucide-svelte";
import { untrack } from "svelte";
import { fade } from "svelte/transition";
import { goto } from "$app/navigation";
import type { ValidationResult } from "$features/config/model/types";
import CidrInfo from "$features/config/ui/CidrInfo.svelte";
import CidrInput from "$features/config/ui/CidrInput.svelte";
import CidrSuggestion from "$features/config/ui/CidrSuggestion.svelte";
import BreadCrumb from "$features/device-management/ui/BreadCrumb.svelte";
import { queryKeys } from "$shared/api/query-keys";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import { cn } from "$shared/lib/utils.js";
import { Button } from "$shared/ui/button/index.js";
import * as Card from "$shared/ui/card/index.js";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import { Textarea } from "$shared/ui/textarea/index";
import {
  networkConfig,
  networkDeletionMutation,
  networkUpdateMutation,
} from "../api/query";

const queryClient = useQueryClient();
let networkId = $derived(getNetworkId().id);
let networkCfg = createQuery(() => networkConfig(networkId));
let cidrFieldInfo: ValidationResult | null = $state(null);
let isConfirming = $state(false);

const updateMutation = createMutation(() =>
  networkUpdateMutation(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.network(networkId) });
    queryClient.invalidateQueries({
      queryKey: queryKeys.networks(),
      exact: true,
    });
  }),
);

const deleteMutation = createMutation(() =>
  networkDeletionMutation(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.network(networkId) });
    queryClient.invalidateQueries({
      queryKey: queryKeys.networks(),
      exact: true,
    });
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
  if (!isConfirming) {
    isConfirming = true;
    return;
  }
  deleteMutation.mutate(networkId);
}
</script>

{#if networkCfg.isSuccess}
  <div class="p-2.5">
    <div
      class="mx-auto mb-4 flex w-full max-w-3xl flex-col justify-between rounded-bl-[4px] border bg-background p-6"
    >
      <BreadCrumb />
      <div class="mt-4 flex flex-col gap-3">
        <div class="space-y-1">
          <h1 class="text-3xl font-bold tracking-tight">Конфигурация сети</h1>
          <p class="text-muted-foreground text-[14px]">
            Управляйте базовыми параметрами, доменом и адресным пространством.
          </p>
        </div>

        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <span class="font-medium">Network ID</span>
          <code
            class="rounded-[6px] border bg-muted/30 px-2.5 py-1 font-mono text-[11px] text-foreground"
          >
            {networkId}
          </code>
        </div>
      </div>
    </div>

    <div class="mx-auto grid w-full max-w-3xl gap-4">
      <Card.Root class="bg-background pt-2">
        <Card.Header class="gap-1 border-b px-6">
          <Card.Title class="text-lg font-semibold">Общие настройки</Card.Title>
          <Card.Description class="text-sm">
            Основные параметры идентификации и маршрутизации сети
          </Card.Description>
        </Card.Header>
        <Card.Content class="p-6">
          <form method="POST" use:enhance class="space-y-5">
            <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Form.Field {form} name="name">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label type="required" class="text-sm">
                      Название сети
                    </Form.Label>
                    <p class="mb-2 text-xs text-muted-foreground">
                      Короткое имя, которое будет отображаться в списках и
                      навигации.
                    </p>
                    <Input
                      {...props}
                      bind:value={$formData.name}
                      placeholder="Моя сеть"
                    />
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors class="mt-1" />
              </Form.Field>

              <Form.Field {form} name="domain">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label type="required" class="text-sm">
                      Домен
                    </Form.Label>
                    <p class="mb-2 text-xs text-muted-foreground">
                      Локальная DNS-зона для адресации устройств внутри сети.
                    </p>
                    <Input
                      {...props}
                      bind:value={$formData.domain}
                      placeholder="internal"
                    />
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors class="mt-1" />
              </Form.Field>
            </div>

            <Form.Field {form} name="description">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label class="text-sm">Описание</Form.Label>
                  <p class="mb-2 text-xs text-muted-foreground">
                    Заметка для команды: назначение сети, окружение или
                    владельцы.
                  </p>
                  <Textarea
                    {...props}
                    bind:value={$formData.description}
                    placeholder="Сеть для рабочих серверов..."
                    class="min-h-24 rounded-[6px]"
                  />
                {/snippet}
              </Form.Control>
              <Form.FieldErrors class="mt-1" />
            </Form.Field>

            <Form.Field {form} name="cidr">
              <Form.Control>
                {#snippet children()}
                  <div class="space-y-1">
                    <div class="flex items-center justify-between gap-3">
                      <div>
                        <p class="text-sm font-medium">Адресное пространство</p>
                        <p class="text-xs text-muted-foreground">
                          CIDR-диапазон, из которого устройства получают
                          внутренние адреса.
                        </p>
                      </div>
                    </div>

                    <div class="rounded-[6px] border bg-muted/20 p-4">
                      {#if $formData.cidr}
                        <CidrInput
                          bind:value={$formData.cidr}
                          bind:info={cidrFieldInfo}
                        />
                        <CidrInfo info={cidrFieldInfo} />
                        <CidrSuggestion bind:cidr={$formData.cidr} />
                      {/if}
                    </div>
                  </div>
                {/snippet}
              </Form.Control>
              <Form.FieldErrors class="mt-1" />
            </Form.Field>

            <div class="flex justify-end border-t pt-5">
              <Button
                type="submit"
                disabled={!valid()}
                class="gap-1 rounded-[6px]"
              >
                Сохранить
                <Save class="size-3.5" />
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card.Root>

      <Card.Root
        class={cn(
          "bg-background transition-colors",
          isConfirming
            ? "ring-destructive/60"
            : "ring-destructive/20"
        )}
      >
        <Card.Header class="border-b px-6">
          <Card.Title
            class="flex items-center gap-2 text-lg font-semibold text-destructive"
          >
            <TriangleAlert class="size-4" />
            Опасная зона
          </Card.Title>
          <Card.Description class="text-sm">
            Удаление сети отключит все устройства и связанные настройки.
          </Card.Description>
        </Card.Header>

        <Card.Content class="p-6">
          <div
            class="flex flex-col gap-4 rounded-[6px] border border-destructive/20 bg-destructive/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p class="text-sm font-medium text-destructive">
                {isConfirming ? "Подтвердите удаление сети" : "Удалить сеть"}
              </p>
              <p class="mt-1 text-xs text-muted-foreground">
                {isConfirming
                  ? "Это действие необратимо. Все устройства будут отключены."
                  : "Нажмите удалить, затем подтвердите действие."}
              </p>
            </div>

            <div class="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button
                variant="destructive"
                size="sm"
                class="rounded-[6px]"
                onclick={handleDelete}
              >
                {isConfirming ? "Подтвердить удаление" : "Удалить сеть"}
              </Button>

              {#if isConfirming}
                <div transition:fade={{ duration: 150 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    class="w-full rounded-[6px]"
                    type="button"
                    onclick={() => (isConfirming = false)}
                  >
                    Отмена
                  </Button>
                </div>
              {/if}
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  </div>
{/if}
