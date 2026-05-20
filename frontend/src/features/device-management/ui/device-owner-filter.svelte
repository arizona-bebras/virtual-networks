<script lang="ts">
import {
  ArrowUpDown,
  Check,
  Funnel,
  type LucideIcon,
  User,
  X,
} from "@lucide/svelte";
import { createQuery, useQueryClient } from "@tanstack/svelte-query";
import type { Column } from "@tanstack/table-core";
import type { DeviceRelations } from "common/schemas/device/index";
import { getNetworkId } from "$shared/lib/network-id-context";
import { cn } from "$shared/lib/utils";
import { Button } from "$shared/ui/button/index.js";
import { Input } from "$shared/ui/input/index.js";
import * as Popover from "$shared/ui/popover/index.js";
import { Separator } from "$shared/ui/separator/index.js";
import { deviceOwners } from "../api/query";
import type { FilterValueWithId } from "../model/types";

let {
  column,
  label,
  icon,
}: {
  column: Column<DeviceRelations, unknown>;
  label: string;
  icon?: LucideIcon;
} = $props();

const queryClient = useQueryClient();
let networkID = $derived(getNetworkId().id);

let filterValue = $derived(
  column.getFilterValue() as FilterValueWithId | undefined,
);

let filterOpenState = $state(false);
let search = $state("");
let Icon = $derived(icon)

const query = createQuery(() => deviceOwners(networkID));

let filteredUsers = $derived(
  query.data?.users?.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()),
  ) ?? [],
);
</script>

<div class="flex items-center justify-between gap-1 px-2">
  <div class="h-8 gap-2 flex items-center">
    {#if Icon}
      <Icon class="mb-1 size-4"/>
    {/if}
    <p>{label}

    </p></div>
  <div>
    <button
      type="button"
      onclick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      <ArrowUpDown class="size-3" />
    </button>
    <Popover.Root bind:open={filterOpenState}>
      <Popover.Trigger><Funnel class="size-3" /></Popover.Trigger>
      <Popover.Content class="w-64 p-4" align="start">
        <div class="space-y-2">
          <h4 class="font-medium leading-none">Filter by {label}</h4>
          <p class="text-sm text-muted-foreground">
            Type the name to filter devices.
          </p>
          <div class="relative">
            <Input
              placeholder="Owner name..."
              bind:value={search}
              class="h-8 pr-8"
            />
            {#if search}
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onclick={() => search = ""}
              >
                <X class="h-3 w-3" />
              </button>
            {/if}
          </div>
        </div>
        {#if query.isSuccess}
          <div class="flex flex-col gap-1 mt-4">
            {#if filterValue}
              <Button
                variant="outline"
                size="sm"
                class="h-8 justify-between font-normal text-xs"
                onclick={() => column.setFilterValue(undefined)}
              >
                Clear filter
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
                  filterValue?.id === user.id && "bg-accent text-accent-foreground font-medium"
                )}
                  onclick={() => {
                  if (filterValue?.id === user.id) {
                    column.setFilterValue(undefined);
                  } else {
                    column.setFilterValue({ id: user.id, name: user.name });
                  }
                }}
                >
                  <div class="flex items-center gap-3 w-full truncate">
                    <div
                      class="flex h-4 w-4 shrink-0 items-center justify-center"
                    >
                      {#if filterValue?.id === user.id}
                        <Check class="h-4 w-4 text-primary" />
                      {:else}
                        <User
                          class="h-4 w-4 text-muted-foreground opacity-50"
                        />
                      {/if}
                    </div>
                    <span class="truncate text-sm">{user.name}</span>
                  </div>
                </Button>
              {:else}
                <p class="text-sm text-muted-foreground text-center py-4">
                  {search ? "No users found" : "No users available"}
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
  </div>
</div>
