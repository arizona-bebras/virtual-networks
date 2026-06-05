<script lang="ts">
import { Check, Funnel, User, X } from "@lucide/svelte";
import { createQuery } from "@tanstack/svelte-query";
import { deviceOwners } from "$features/device-management/api/query";
import { client } from "$shared/api/openapi-client";
import { queryKeys } from "$shared/api/query-keys";
import { getNetworkId } from "$shared/lib/network-id-context";
import { cn } from "$shared/lib/utils";
import { Button } from "$shared/ui/button/index.js";
import { Input } from "$shared/ui/input/index.js";
import * as Popover from "$shared/ui/popover/index.js";
import { Separator } from "$shared/ui/separator/index.js";

type FilterValue = {
  id: string;
  name: string;
};

let {
  value,
  onSelect,
}: {
  value: FilterValue | undefined;
  onSelect: (value: FilterValue | undefined) => void;
} = $props();

const networkID = $derived(getNetworkId().id);
let search = $state("");

const query = createQuery(() => deviceOwners(networkID));

let filteredUsers = $derived(
  query.data?.users?.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()),
  ) ?? [],
);
</script>

<Popover.Root>
  <Popover.Trigger><Funnel class="size-3" /></Popover.Trigger>

  <Popover.Content class="w-64 p-4">
    <div class="space-y-2">
      <p class="text-sm text-muted-foreground">
        Введите имя для фильтрации устройств
      </p>
      <div class="relative">
        <Input
          placeholder="Имя владельца..."
          bind:value={search}
          class="h-8 pr-8"
        />
        {#if search}
          <button
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onclick={() => (search = "")}
          >
            <X class="h-3 w-3" />
          </button>
        {/if}
      </div>
    </div>
    {#if query.isSuccess}
      <div class="flex flex-col gap-1 mt-4">
        {#if value}
          <Button
            variant="outline"
            size="sm"
            class="h-8 justify-between font-normal text-xs"
            onclick={() => onSelect(undefined)}
          >
            Очистить фильтр
            <X class="h-3 w-3 opacity-50" />
          </Button>
          <Separator class="my-1" />
        {/if}

        <div class="max-h-[200px] overflow-y-auto pr-1 flex flex-col gap-1">
          {#each filteredUsers as user (user.id)}
            <Button
              variant="ghost"
              size="sm"
              class={cn(
                "justify-start font-normal w-full px-2 h-9",
                value?.id === user.id && "bg-accent text-accent-foreground font-medium"
              )}
              onclick={() => {
                if (value?.id === user.id) {
                  onSelect(undefined);
                } else {
                  onSelect({ id: user.id, name: user.name });
                }
              }}
            >
              <div class="flex items-center gap-3 w-full truncate">
                <div class="flex h-4 w-4 shrink-0 items-center justify-center">
                  {#if value?.id === user.id}
                    <Check class="h-4 w-4 text-primary" />
                  {:else}
                    <User class="h-4 w-4 text-muted-foreground opacity-50" />
                  {/if}
                </div>
                <span class="truncate text-sm">{user.name}</span>
              </div>
            </Button>
          {:else}
            <p class="text-sm text-muted-foreground text-center py-4">
              {search
                ? "Пользователи не найдены"
                : "Нет доступных пользователей"}
            </p>
          {/each}
        </div>
      </div>
    {:else if query.isLoading}
      <div class="flex flex-col gap-1 mt-4">
        <div class="h-8 w-full animate-pulse rounded-md bg-muted"></div>
        <div class="h-8 w-full animate-pulse rounded-md bg-muted"></div>
        <div class="h-8 w-full animate-pulse rounded-md bg-muted"></div>
      </div>
    {/if}
  </Popover.Content>
</Popover.Root>
