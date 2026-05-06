<script lang="ts">
import { Filter, X } from "@lucide/svelte";
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
}: { column: Column<DeviceRelations, unknown>; label: string } = $props();

// let filterValue = $derived(
//   (column.getFilterValue() as DeviceTagsFilterValue) ?? [],
// );
</script>

<div class="flex items-center gap-1">
  <span class="text-sm font-medium">{label}</span>

  <Popover.Root>
    <Popover.Trigger>
      <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground">
        <Filter class="h-3.5 w-3.5" />
      </Button>
    </Popover.Trigger>
    <Popover.Content class="w-72 p-4" align="start">
      <div class="space-y-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="font-medium leading-none">Filter by {label}</h4>
          </div>
          <p class="text-sm text-muted-foreground">
            Select tag names to filter devices.
          </p>
        </div>
        <TagSelector {column} />
      </div>
    </Popover.Content>
  </Popover.Root>
</div>
