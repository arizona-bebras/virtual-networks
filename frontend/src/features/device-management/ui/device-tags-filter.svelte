<script lang="ts">
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Funnel,
  type LucideIcon,
  X,
} from "@lucide/svelte";
import type { Column, SortDirection } from "@tanstack/table-core";
import type { DeviceRelations } from "common/schemas/device/index";
import TagSelector from "$features/tag-management/ui/tag-selector.svelte";
import { Button } from "$shared/ui/button/index.js";
import * as Popover from "$shared/ui/popover/index.js";
import { Separator } from "$shared/ui/separator/index.js";
import type { DeviceTagsFilterValue } from "../model/types";

let {
  column,
  label,
  sort,
  icon,
}: {
  column: Column<DeviceRelations, unknown>;
  label: string;
  sort: false | SortDirection;
  icon?: LucideIcon;
} = $props();

let Icon = $derived(icon);
let filterValue = $derived(
  (column.getFilterValue() as DeviceTagsFilterValue) ?? [],
);
</script>

<div class="flex items-center justify-between gap-1 px-2">
  <button
    type="button"
    class="h-8 gap-2 flex grow items-center justify-between"
    onclick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  >
    <div class="flex">
      {#if Icon}
        <Icon class="mb-1 size-4 mr-1" />
      {/if}
      <p>{label}</p>
    </div>
    {#if sort === "asc"}
      <ArrowUp class="ml-2 size-3" />
    {:else if sort === "desc"}
      <ArrowDown class="ml-2 size-3" />
    {:else}
      <ArrowUpDown class="ml-2 size-3" />
    {/if}
  </button>
  <div class="flex items-center">
    <Popover.Root>
      <Popover.Trigger><Funnel class="size-3" /></Popover.Trigger>
      <Popover.Content class="w-80 p-4">
        <div class="space-y-2 mb-4">
          <h4 class="font-medium leading-none">Фильтр по: {label}</h4>
          <p class="text-sm text-muted-foreground">
            Выберите теги для фильтрации устройств
          </p>
        </div>

        {#if filterValue.length > 0}
          <Button
            variant="outline"
            size="sm"
            class="h-8 justify-between font-normal text-xs w-full mb-2"
            onclick={() => column.setFilterValue(undefined)}
          >
            Очистить фильтры
            <X class="h-3 w-3 opacity-50" />
          </Button>
          <Separator class="my-2" />
        {/if}

        <TagSelector {column} />
      </Popover.Content>
    </Popover.Root>
  </div>
</div>
