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
import type { RuleRelation } from "common/schemas/rule/index";
import TagSelector from "$features/tag-management/ui/tag-selector.svelte";
import { Button } from "$shared/ui/button/index.js";
import * as Popover from "$shared/ui/popover/index.js";
import { Separator } from "$shared/ui/separator/index.js";

let {
  column,
  label,
  sort,
  icon,
}: {
  column: Column<RuleRelation, unknown>;
  label: string;
  sort: false | SortDirection;
  icon?: LucideIcon;
} = $props();

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
        <TagSelector {column} />
      </Popover.Content>
    </Popover.Root>
  </div>
</div>
