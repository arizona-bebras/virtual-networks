<script lang="ts">
import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/svelte-query";
import { UpdateNetworkSchema } from "common/schemas/network/update-network";
import { TriangleAlert } from "lucide-svelte";
import { untrack } from "svelte";
import { fade } from "svelte/transition";
import { z } from "zod";
import { goto } from "$app/navigation";
import type { ValidationResult } from "$features/config/model/types";
import CidrInfo from "$features/config/ui/CidrInfo.svelte";
import CidrInput from "$features/config/ui/CidrInput.svelte";
import CidrSuggestion from "$features/config/ui/CidrSuggestion.svelte";
import { queryKeys } from "$shared/api/query-keys";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { getNetworkId } from "$shared/lib/network-id-context";
import { cn } from "$shared/lib/utils.js";
import Particles from "$shared/magic/particles/particles.svelte";
import { Button } from "$shared/ui/button/index.js";
import * as Card from "$shared/ui/card/index.js";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import { Separator } from "$shared/ui/separator/index.js";
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
  <div
    class="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden py-8 px-4 sm:px-6 lg:px-8"
  >
    <Particles
      class="absolute inset-0 z-0"
      quantity={180}
      staticity={50}
      color="#000000"
    />

    <div class="relative z-10 mx-auto max-w-2xl space-y-6">
      <!-- Header Section -->
      <div
        class="space-y-2 text-center animate-in fade-in slide-in-from-top duration-500"
      >
        <h1 class="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Конфигурация сети
        </h1>
        <p class="mx-auto max-w-lg text-sm text-muted-foreground">
          Настройте параметры вашей виртуальной сети и адресное пространство.
        </p>

        <div
          class="flex items-center justify-center gap-2 pt-1 delay-100 animate-in fade-in slide-in-from-top duration-500"
        >
          <span
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50"
          >
            Network ID:
          </span>
          <code
            class="rounded-full border bg-background/50 px-3 py-0.5 text-[11px] font-medium backdrop-blur-sm transition-colors hover:border-primary/50"
          >
            {networkId}
          </code>
        </div>
      </div>

      <!-- Settings Card -->
      <div class="animate-in fade-in slide-in-from-bottom duration-500">
        <Card.Root
          class="overflow-hidden border-none bg-background/60 shadow-xl shadow-primary/5 backdrop-blur-xl ring-1 ring-border/50 rounded-3xl"
        >
          <Card.Header class="border-b bg-muted/20 pb-5 pt-6 px-6 sm:px-8">
            <Card.Title class="text-xl">Общие настройки</Card.Title>
            <Card.Description class="text-xs">
              Основные параметры идентификации и маршрутизации
            </Card.Description>
          </Card.Header>
          <Card.Content class="p-6 sm:p-8">
            <form method="POST" use:enhance class="space-y-5 w-full">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Form.Field {form} name="name">
                  <Form.Control>
                    {#snippet children({ props })}
                      <Form.Label
                        class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5"
                      >
                        Название сети
                      </Form.Label>
                      <Input
                        {...props}
                        bind:value={$formData.name}
                        placeholder="Моя сеть"
                        class="h-10 bg-background/50 rounded-xl focus:bg-background transition-all"
                      />
                    {/snippet}
                  </Form.Control>
                  <Form.FieldErrors class="text-[10px]" />
                </Form.Field>
                <Form.Field {form} name="domain">
                  <Form.Control>
                    {#snippet children({ props })}
                      <Form.Label
                        class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5"
                      >
                        Домен
                      </Form.Label>
                      <Input
                        {...props}
                        bind:value={$formData.domain}
                        placeholder="internal"
                        class="h-10 bg-background/50 rounded-xl focus:bg-background transition-all"
                      />
                    {/snippet}
                  </Form.Control>
                  <Form.FieldErrors class="text-[10px]" />
                </Form.Field>
              </div>

              <Form.Field {form} name="description">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label
                      class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5"
                    >
                      Описание
                    </Form.Label>
                    <Textarea
                      {...props}
                      bind:value={$formData.description}
                      placeholder="Сеть для рабочих серверов..."
                      class="min-h-[80px] bg-background/50 rounded-xl focus:bg-background transition-all"
                    />
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors class="text-[10px]" />
              </Form.Field>
              <div>
                <p
                  class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5 mb-1"
                >
                  Адресное пространство
                </p>
                <div
                  class="relative space-y-3 rounded-2xl border bg-muted/40 p-5 sm:p-6 ring-1 ring-border/30"
                >
                  {#if $formData.cidr}
                    <div class="space-y-3">
                      <CidrInput
                        bind:value={$formData.cidr}
                        bind:info={cidrFieldInfo}
                      />
                      <CidrInfo info={cidrFieldInfo} />
                      <CidrSuggestion bind:cidr={$formData.cidr} />
                    </div>
                  {/if}
                </div>
              </div>

              <div class="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={!valid()}
                  class="px-8 h-10 font-bold transition-all active:scale-95 rounded-xl shadow-md shadow-primary/10"
                >
                  Сохранить
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card.Root>
      </div>

      <!-- Danger Zone -->
      <div
        class="pt-2 delay-400 animate-in fade-in slide-in-from-bottom duration-700"
      >
        <div
          class={cn(
            "group relative overflow-hidden rounded-2xl border transition-all duration-500",
            isConfirming 
              ? "border-destructive bg-destructive/[0.03] shadow-lg shadow-destructive/5" 
              : "border-destructive/10 bg-destructive/[0.01] hover:border-destructive/20"
          )}
        >
          <!-- Warning background pattern that appears on confirmation -->
          <div
            class={cn(
              "absolute inset-0 opacity-[0.02] pointer-events-none transition-opacity duration-500",
              isConfirming ? "opacity-[0.06]" : "opacity-[0.03]"
            )}
            style="background-image: repeating-linear-gradient(45deg, var(--destructive) 0, var(--destructive) 1px, transparent 0, transparent 10px);"
          ></div>

          <div
            class="relative flex flex-col items-center justify-between gap-4 p-4 sm:p-5 backdrop-blur-sm sm:flex-row"
          >
            <div class="flex items-center gap-4">
              <div
                class={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-500",
                  isConfirming 
                    ? "bg-destructive text-destructive-foreground rotate-6 scale-105 shadow-md shadow-destructive/20" 
                    : "bg-destructive/5 text-destructive ring-1 ring-destructive/10"
                )}
              >
                <TriangleAlert
                  class={cn("size-5", isConfirming && "animate-pulse")}
                />
              </div>

              <div class="space-y-0.5 text-center sm:text-left">
                <h3
                  class={cn(
                  "text-sm font-black tracking-tight uppercase transition-colors duration-500",
                  isConfirming ? "text-destructive" : "text-destructive/70"
                )}
                >
                  {isConfirming ? "Удалить сеть?" : "Опасная зона"}
                </h3>
                <p
                  class="text-[10px] font-medium leading-tight text-muted-foreground/60 max-w-[280px]"
                >
                  {isConfirming 
                    ? "Это действие необратимо. Все устройства будут отключены." 
                    : "Удаление сети приведет к отключению всех устройств."}
                </p>
              </div>
            </div>

            <div class="flex flex-col items-center gap-2 w-full sm:w-auto">
              <Button
                variant="destructive"
                size="sm"
                class={cn(
                  "h-8 px-6 text-[11px] font-bold uppercase tracking-tight transition-all duration-300 rounded-lg",
                  isConfirming 
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 scale-105 shadow-md shadow-destructive/20" 
                    : "shadow-sm shadow-destructive/5 hover:shadow-destructive/10"
                )}
                onclick={handleDelete}
              >
                {isConfirming ? "Подтвердить" : "Удалить"}
              </Button>

              {#if isConfirming}
                <button
                  class="text-[8px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5"
                  type="button"
                  onclick={() => (isConfirming = false)}
                  transition:fade={{ duration: 150 }}
                >
                  Отмена
                </button>
              {/if}
            </div>
          </div>
        </div>

        <p
          class="mt-4 text-center text-[7px] font-bold uppercase tracking-[0.4em] text-muted-foreground/15 pointer-events-none select-none"
        >
          Permanent Destruction Zone
        </p>
      </div>
    </div>
  </div>
{/if}
