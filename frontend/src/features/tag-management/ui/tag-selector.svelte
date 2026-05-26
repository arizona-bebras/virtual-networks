<!-- tag selector -->
<script lang="ts">
import { createQuery } from "@tanstack/svelte-query";
import type { Column } from "@tanstack/table-core";
import type { DeviceRelations } from "common/schemas/device/index";
import { Debounced } from "runed";
import DeviceCell from "$entities/device/ui/device-tags-cell.svelte";
import type { FilterValueWithId } from "$features/device-management/model/types";
import { deviceTags } from "$pages/app/network/[slug]/tags/api/query";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Input } from "$shared/ui/input/index";
import { Separator } from "$shared/ui/separator/index";

let {
  column,
  onclick,
  excludedTags,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: <cuz literaly any>
  column?: Column<any, any>;
  onclick?: (name: string) => void;
  excludedTags?: DeviceRelations["tags"];
} = $props();

// let queryClient = useQueryClient();
let networkID = $derived(getNetworkId().id);

let search = $state("");
const debounced = new Debounced(() => search, 500);

const query = createQuery(() =>
  deviceTags.userTags(networkID, debounced.current),
);

let filterValue = $derived(
  (column?.getFilterValue() as FilterValueWithId[]) ?? [],
);

let selectedTags = $derived(
  (query.data || []).filter((tag) => filterValue.some((f) => f.id === tag.id)),
);
let availableTags = $derived(
  (query.data || []).filter((tag) => !filterValue.some((f) => f.id === tag.id)),
);

function toggleTag(tag: FilterValueWithId) {
  const current = (column?.getFilterValue() as FilterValueWithId[]) ?? [];
  let next: FilterValueWithId[];
  if (current.some((t) => t.id === tag.id)) {
    next = current.filter((t) => t.id !== tag.id);
  } else {
    next = [...current, tag];
  }
  column?.setFilterValue(next.length > 0 ? next : undefined);
}
</script>

<Input placeholder="Поиск тегов..." bind:value={search} class="h-8" />

{#if selectedTags.length > 0}
  <div class="space-y-2">
    <p
      class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
    >
      Выбранные
    </p>
    {#if onclick}
      <DeviceCell tags={selectedTags} {onclick} {excludedTags} />
    {:else}
      <DeviceCell
        tags={selectedTags}
        onclick={(name) => {
                const tag = selectedTags.find(t => t.name === name);
                if (tag) toggleTag(tag);
              }}
      />
    {/if}
  </div>
  <Separator />
{/if}

<div class="space-y-2">
  {#if selectedTags.length > 0}
    <p
      class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
    >
      Доступные
    </p>
  {/if}
  {#if availableTags.length > 0}
    {#if onclick}
      <DeviceCell tags={availableTags} {onclick} {excludedTags} />
    {:else}
      <DeviceCell
        tags={availableTags}
        onclick={(name) => {
                const tag = availableTags.find(t => t.name === name);
                if (tag) toggleTag(tag);
              }}
      />
    {/if}
  {:else}
    <p class="text-xs text-muted-foreground italic">Теги не найдены.</p>
  {/if}
</div>
