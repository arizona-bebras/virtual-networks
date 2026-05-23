<script lang="ts">
import { ArrowUpDown, Funnel, type LucideIcon } from "@lucide/svelte";
import type { Column } from "@tanstack/table-core";
import type { RuleRelation } from "common/schemas/rule/index";
import TagSelector from "$features/tag-management/ui/tag-selector.svelte";
import * as Popover from "$shared/ui/popover/index.js";

let {
  column,
  label,
  icon,
}: {
  column: Column<RuleRelation, unknown>;
  label: string;
  icon?: LucideIcon;
} = $props();

let Icon = $derived(icon);
</script>

<div class="flex items-center justify-between gap-1 px-2">
  <div class="h-8 gap-2 flex items-center">
    {#if Icon}
      <Icon class="mb-1 size-4" />
    {/if}
    <p>{label}</p>
  </div>
  <div class="flex items-center gap-1">
    <button
      type="button"
      onclick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      <ArrowUpDown class="size-3" />
    </button>
    <Popover.Root>
      <Popover.Trigger><Funnel class="size-3" /></Popover.Trigger>
      <Popover.Content class="w-72 p-4" align="end">
        <TagSelector {column} />
      </Popover.Content>
    </Popover.Root>
  </div>
</div>
