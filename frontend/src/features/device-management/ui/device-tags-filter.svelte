<script lang="ts">
import { Filter, X } from "@lucide/svelte";
import { createQuery, useQueryClient } from "@tanstack/svelte-query";
import type { Column } from "@tanstack/table-core";
import type { DeviceRelations } from "common/schemas/device/index";
import { Debounced } from "runed";
import DeviceCell from "$entities/device/ui/device-tags-cell.svelte";
import { deviceQuery } from "$pages/app/network/[slug]/devices/api/query";
import { deviceTags } from "$pages/app/network/[slug]/tags/api/query";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import { Input } from "$shared/ui/input/index.js";
import * as Popover from "$shared/ui/popover/index.js";
import { Separator } from "$shared/ui/separator/index.js";
import type { DeviceTagsFilterValue } from "../model/types";

let {
  column,
  label,
}: { column: Column<DeviceRelations, unknown>; label: string } = $props();

let queryClient = useQueryClient();
let networkID = $derived(getNetworkId().id);

let filterValue = $derived(
  (column.getFilterValue() as DeviceTagsFilterValue) ?? [],
);

let search = $state("");
const debounced = new Debounced(() => search, 500);

const query = createQuery(() =>
  deviceTags.userTags(networkID, debounced.current),
);

let selectedTags = $derived(
  (query.data || []).filter((tag) => filterValue.some((f) => f.id === tag.id)),
);
let availableTags = $derived(
  (query.data || []).filter((tag) => !filterValue.some((f) => f.id === tag.id)),
);

function toggleTag(tag: { id: string; name: string }) {
  const current = (column.getFilterValue() as DeviceTagsFilterValue) ?? [];
  let next: DeviceTagsFilterValue;
  if (current.some((t) => t.id === tag.id)) {
    next = current.filter((t) => t.id !== tag.id);
  } else {
    next = [...current, { id: tag.id, name: tag.name }];
  }
  column.setFilterValue(next.length > 0 ? next : undefined);
}

function clearFilters() {
  column.setFilterValue(undefined);
}
</script>

<div class="flex items-center gap-1">
  <span class="text-sm font-medium">{label}</span>

  <Popover.Root>
    <Popover.Trigger>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 {filterValue.length > 0 ? 'text-primary' : 'text-muted-foreground'}"
      >
        <Filter class="h-3.5 w-3.5" />
      </Button>
    </Popover.Trigger>
    <Popover.Content class="w-72 p-4" align="start">
      <div class="space-y-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="font-medium leading-none">Filter by {label}</h4>
            {#if filterValue.length > 0}
              <Button
                variant="ghost"
                size="sm"
                class="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                onclick={clearFilters}
              >
                Clear all
              </Button>
            {/if}
          </div>
          <p class="text-sm text-muted-foreground">
            Select tag names to filter devices.
          </p>
          <Input placeholder="Search tags..." bind:value={search} class="h-8" />
        </div>

        {#if selectedTags.length > 0}
          <div class="space-y-2">
            <p
              class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Selected
            </p>
            <DeviceCell
              tags={selectedTags}
              onclick={(name) => {
                const tag = selectedTags.find(t => t.name === name);
                if (tag) toggleTag(tag);
              }}
            />
          </div>
          <Separator />
        {/if}

        <div class="space-y-2">
          {#if selectedTags.length > 0}
            <p
              class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Available
            </p>
          {/if}
          {#if availableTags.length > 0}
            <DeviceCell
              tags={availableTags}
              onclick={(name) => {
                const tag = availableTags.find(t => t.name === name);
                if (tag) toggleTag(tag);
              }}
            />
          {:else}
            <p class="text-xs text-muted-foreground italic">
              No more tags found.
            </p>
          {/if}
        </div>
      </div>
    </Popover.Content>
  </Popover.Root>
</div>
