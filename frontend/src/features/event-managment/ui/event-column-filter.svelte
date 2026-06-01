<script lang="ts">
import { ArrowDown, ArrowUp, ArrowUpDown, Funnel, type LucideIcon } from "@lucide/svelte";
import type { Column, SortDirection } from "@tanstack/table-core";
import * as Popover from "$shared/ui/popover/index.js";
import type { Event } from "common/schemas/event/index";

let {
  column,
  label,
  sort,
  icon,
}: {
  column: Column<Event, unknown>;
  label: string;
  sort: false | SortDirection;
  icon?: LucideIcon;
} = $props();

let Icon = $derived(icon);
</script>

<div class="flex items-center justify-between gap-1 px-2">
  <button
    type="button"
    class="flex h-8 grow items-center justify-between gap-2"
    onclick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  >
    <div class="flex items-center">
      {#if Icon}
        <Icon class="mr-1 mb-1 size-4" />
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
        <p class="text-sm text-muted-foreground">Базовый фильтр</p>
      </Popover.Content>
    </Popover.Root>
  </div>
</div>
