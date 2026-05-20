<script lang="ts" generics="TData">
import { X } from "@lucide/svelte";
import type { Table } from "@tanstack/table-core";
import { fade } from "svelte/transition";
import TagBadge from "$entities/tag/ui/tag-badge.svelte";
import { colorVariants } from "$shared/lib/tag-color-mapping";
import { Badge } from "$shared/ui/badge/index.js";
import { Button } from "$shared/ui/button/index.js";

type Props<TData> = {
  table: Table<TData> | undefined;
};

let { table }: Props<TData> = $props();

const columnFilters = $derived(table?.getState().columnFilters ?? []);

function getFilterLabel(value: unknown): string {
  if (typeof value === "object" && value !== null && "name" in value) {
    return String((value as { name: unknown }).name);
  }
  return String(value);
}
</script>

{#if table && columnFilters.length > 0}
  <div class="flex flex-wrap gap-2 py-2" in:fade>
    {#each columnFilters as filter (filter.id)}
      {@const column = table.getColumn(filter.id)}
      {@const Icon = column?.columnDef.meta?.icon}

      <!-- Обработка тегов -->
      {#if Array.isArray(filter.value)}
        {#each filter.value as value}
          <TagBadge tag={value} isIcon={true} />
        {/each}
      {:else}
        <Badge
          variant="secondary"
          class="h-7 gap-1 px-2 font-normal border border-border rounded-[4px] bg-primary text-muted-foreground"
        >
          {#if Icon}
            <Icon class="mr-1 size-3 text-muted-foreground stroke-3" />
          {/if}
          <span class="capitalize font-medium">{getFilterLabel(filter.value)}</span>
          <button
            type="button"
            class="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onclick={() => column?.setFilterValue(undefined)}
          >
            <X class="size-3 text-muted-foreground hover:text-foreground" />
            <span class="sr-only">Remove filter</span>
          </button>
        </Badge>
      {/if}
    {/each}
    <Button
      variant="ghost"
      size="sm"
      class="h-7 px-2 text-xs"
      onclick={() => table.resetColumnFilters()}
    >
      Clear all
    </Button>
  </div>
{/if}
