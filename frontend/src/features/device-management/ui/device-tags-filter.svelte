<script lang="ts">
import { ArrowUpDown, Funnel, type LucideIcon } from "@lucide/svelte";
import { createQuery, useQueryClient } from "@tanstack/svelte-query";
import type { Column } from "@tanstack/table-core";
import type { DeviceRelations } from "common/schemas/device/index";
import { Debounced } from "runed";
import DeviceCell from "$entities/device/ui/device-tags-cell.svelte";
import TagSelector from "$features/tag-management/ui/tag-selector.svelte";
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
  icon,
}: {
  column: Column<DeviceRelations, unknown>;
  label: string;
  icon?: LucideIcon;
} = $props();

let Icon = $derived(icon);
// let filterValue = $derived(
//   (column.getFilterValue() as DeviceTagsFilterValue) ?? [],
// );
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
