<script lang="ts">
import { ArrowUpDown, Filter } from "@lucide/svelte";
import { createQuery, useQueryClient } from "@tanstack/svelte-query";
import type { Column } from "@tanstack/table-core";
import { Debounced } from "runed";
import { untrack } from "svelte";
import { deviceQuery } from "$pages/app/network/[slug]/devices/api/query";
import { deviceTags } from "$pages/app/network/[slug]/tags/api/query";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import { Input } from "$shared/ui/input/index.js";
import * as Popover from "$shared/ui/popover/index.js";

let { column, label }: { column: Column<any, any>; label: string } = $props();

const queryClient = useQueryClient();
let networkID = $derived(getNetworkId().id);

let filterValue = $state((column.getFilterValue() as string) ?? "");

let search = $state("");
const debounced = new Debounced(() => search, 500);

// TODO: Изменить запрос после реализаци нужного endpont
const query = createQuery(() =>
  deviceQuery.userDevices({
    networkId: networkID,
    owner_id: debounced.current,
  }),
);

// function handleInput(e: Event) {
//   const value = (e.target as HTMLInputElement).value;
//   filterValue = value;
//   column.setFilterValue(value || undefined);
// }
</script>

<div class="flex items-center gap-1">
  <Button
    variant="ghost"
    size="sm"
    class="-ml-3 h-8 gap-2 px-2"
    onclick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  >
    <span>{label}</span>
    <ArrowUpDown class="h-4 w-4" />
  </Button>

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
          Type the name to filter devices.
        </p>
        <Input placeholder="Owner name..." bind:value={search} class="h-8" />
      </div>
      {#if query.isSuccess}
        <div class="flex flex-col gap-2">
          {#each query.data as device (device.id)}
            <button
              type="button"
              class="p-2 border border-white truncate hover:opacity-50"
              onclick={() => {
                column.setFilterValue({id: device.id, name: device.name});
              }}
            >
              {device.owner}
            </button>
          {/each}
        </div>
      {/if}
    </Popover.Content>
  </Popover.Root>
</div>
