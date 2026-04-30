<script lang="ts">
import { Filter } from "@lucide/svelte";
import { createQuery, useQueryClient } from "@tanstack/svelte-query";
import type { Column } from "@tanstack/table-core";
import { Debounced } from "runed";
import DeviceCell from "$entities/device/ui/device-tags-cell.svelte";
import { deviceQuery } from "$pages/app/network/[slug]/devices/api/query";
import { deviceTags } from "$pages/app/network/[slug]/tags/api/query";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import { Input } from "$shared/ui/input/index.js";
import * as Popover from "$shared/ui/popover/index.js";

let { column, label }: { column: Column<any, any>; label: string } = $props();

let queryClient = useQueryClient();
let networkID = $derived(getNetworkId().id);

let filterValue = $state((column.getFilterValue() as string) ?? "");

let search = $state("");
const debounced = new Debounced(() => search, 500);

const query = createQuery(() =>
  deviceTags.userTags(networkID, debounced.current),
);
</script>

<div class="flex items-center gap-1">
  <span class="text-sm font-medium">{label}</span>

  <Popover.Root>
    <Popover.Trigger>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 {filterValue ? 'text-primary' : 'text-muted-foreground'}"
      >
        <Filter class="h-3.5 w-3.5" />
      </Button>
    </Popover.Trigger>
    <Popover.Content class="w-64 p-4" align="start">
      <div class="space-y-2">
        <h4 class="font-medium leading-none">Filter by {label}</h4>
        <p class="text-sm text-muted-foreground">
          Type a tag name to filter devices.
        </p>
        <Input
          placeholder="Tag name..."
          bind:value={search}
          class="h-8"
        />
      </div>
      <div>
        <DeviceCell
          tags={query?.data || []}
          onclick={(name) => {
            search = name;
            filterValue = name;
            column.setFilterValue(name);
          }}
        />
      </div>
    </Popover.Content>
  </Popover.Root>
</div>
