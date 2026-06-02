<script lang="ts">
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Funnel,
  type LucideIcon,
} from "@lucide/svelte";
import type { Column, SortDirection } from "@tanstack/table-core";
import type { DeviceRelations } from "common/schemas/device/index";
import UserFilterPopover from "$entities/user/ui/user-filter-popover.svelte";
import type { FilterValueWithId } from "../model/types";

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

let filterValue = $derived(
  column.getFilterValue() as FilterValueWithId | undefined,
);

let filterOpenState = $state(false);
let Icon = $derived(icon);
</script>

<div class="flex items-center justify-between gap-1 px-2">
  <button
    type="button"
    class="h-8 gap-2 flex grow items-center justify-between"
    onclick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  >
    <div class="flex">
      {#if Icon}
        <Icon class="mb-1 size-4" />
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
    <UserFilterPopover
      value={filterValue}
      onSelect={(val) => {
        column.setFilterValue(val);
      }}
    />
  </div>
</div>
