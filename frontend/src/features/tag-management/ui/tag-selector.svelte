<!-- tag selector -->
<script lang="ts">
import { Plus, Tag } from "@lucide/svelte";
import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/svelte-query";
import type { Column } from "@tanstack/table-core";
import type { DeviceRelations } from "common/schemas/device/index";
import type { Tag as TagType } from "common/schemas/tag/index";
import { Debounced } from "runed";
import DeviceCell from "$entities/device/ui/device-tags-cell.svelte";
import type { FilterValueWithId } from "$features/device-management/model/types";
import { deviceTags } from "$pages/app/network/[slug]/tags/api/query";
import { client } from "$shared/api/openapi-client";
import { queryKeys } from "$shared/api/query-keys";
import { getNetworkId } from "$shared/lib/network-id-context";
import { Button } from "$shared/ui/button/index.js";
import { Input } from "$shared/ui/input/index";
import { Separator } from "$shared/ui/separator/index";

let {
  column,
  onclick,
  excludedTags,
  oncreate,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: <cuz literaly any>
  column?: Column<any, any>;
  onclick?: (name: string) => void;
  excludedTags?: DeviceRelations["tags"];
  oncreate?: (tag: TagType) => void;
} = $props();

const queryClient = useQueryClient();
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

// inline create form
const colors = [
  { label: "Red", value: "red", bg: "bg-red-500" },
  { label: "Green", value: "green", bg: "bg-green-500" },
  { label: "Blue", value: "blue", bg: "bg-blue-500" },
  { label: "Yellow", value: "yellow", bg: "bg-yellow-500" },
  { label: "Purple", value: "purple", bg: "bg-purple-500" },
  { label: "Orange", value: "orange", bg: "bg-orange-500" },
] as const;

let showCreate = $state(false);
let newName = $state("");
let newColor = $state<string | null>(null);

const createMutationFn = createMutation(() => ({
  mutationFn: async () => {
    const { data, error } = await client.POST("/networks/{network_id}/tags", {
      params: { path: { network_id: networkID } },
      body: { name: newName.trim(), color: newColor as TagType["color"] },
    });
    if (error) throw error;
    return data;
  },
  onSuccess: (created) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.networkTags(networkID),
    });
    if (created) oncreate?.(created);
    newName = "";
    newColor = null;
    showCreate = false;
  },
}));

function handleCreate(e: Event) {
  e.preventDefault();
  if (!newName.trim()) return;
  createMutationFn.mutate();
}
</script>

<Input placeholder="Поиск тегов..." bind:value={search} class="h-8" />

{#if selectedTags.length > 0}
  <div class="space-y-2">
    и <p
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
  {:else if !showCreate}
    <p class="text-xs text-muted-foreground italic">Теги не найдены.</p>
  {/if}
</div>

<div class="border-t border-border mt-1 pt-1">
  {#if showCreate}
    <p
      class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2"
    >
      Новый тег
    </p>
    <Input
      bind:value={newName}
      placeholder="Название..."
      class="h-7 text-xs mb-2"
    />
    <div class="flex gap-1.5 mb-2">
      {#each colors as color}
        {@const isSelected = newColor === color.value}
        <button
          type="button"
          class="size-5 rounded-full {color.bg} transition-all hover:scale-110 {isSelected ? 'ring-2 ring-offset-1 ring-foreground/60' : ''}"
          title={color.label}
          onclick={() => (newColor = color.value)}
        ></button>
      {/each}
    </div>
    <div class="flex gap-1">
      <Button
        size="sm"
        class="flex-1 h-7 text-xs"
        disabled={!newName.trim() || createMutationFn.isPending}
        onclick={handleCreate}
      >
        {createMutationFn.isPending ? "..." : "Создать"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        class="h-7 text-xs"
        onclick={() => { showCreate = false; newName = ""; newColor = null; }}
      >
        Отмена
      </Button>
    </div>
  {:else}
    <button
      type="button"
      class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground w-full py-0.5 transition-colors"
      onclick={() => (showCreate = true)}
    >
      <Tag size={11} />
      Новый тег
    </button>
  {/if}
</div>
