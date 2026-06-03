<script lang="ts">
import { MonitorSmartphone, Settings, Shield, Tag } from "@lucide/svelte";
import type { Column } from "@tanstack/table-core";
import type { Event } from "common/schemas/event/index";
import { Separator } from "$shared/ui/separator/index.js";

let {
  column,
}: {
  column: Column<Event, unknown>;
} = $props();

const options = [
  { value: "device", label: "Устройства", icon: MonitorSmartphone },
  { value: "rule", label: "Правила", icon: Shield },
  { value: "tag", label: "Теги", icon: Tag },
  { value: "network", label: "Конфигурация", icon: Settings },
] as const;

let selectedEntities = $derived<string[]>(
  (column.getFilterValue() as string[]) ?? [],
);

let selectedList = $derived(
  options.filter((opt) => selectedEntities.includes(opt.value)),
);
let availableList = $derived(
  options.filter((opt) => !selectedEntities.includes(opt.value)),
);

function toggleEntity(value: string) {
  let nextValue: string[];
  if (selectedEntities.includes(value)) {
    nextValue = selectedEntities.filter((v) => v !== value);
  } else {
    nextValue = [...selectedEntities, value];
  }

  column.setFilterValue(nextValue.length > 0 ? nextValue : undefined);
}
</script>

<div class="flex flex-col gap-4">
  {#if selectedList.length > 0}
    <div class="space-y-2">
      <p
        class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
      >
        Выбранные
      </p>
      <div class="flex flex-col gap-1">
        {#each selectedList as item}
          {@const Icon = item.icon}
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-md p-1 text-sm transition-colors hover:bg-accent"
            onclick={() => toggleEntity(item.value)}
          >
            <Icon class="size-4 text-muted-foreground" />
            <span class="font-medium">{item.label}</span>
          </button>
        {/each}
      </div>
    </div>
    <Separator />
  {/if}

  <div class="space-y-2">
    {#if selectedList.length > 0}
      <p
        class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
      >
        Доступные
      </p>
    {/if}
    {#if availableList.length > 0}
      <div class="flex flex-col gap-1">
        {#each availableList as item}
          {@const Icon = item.icon}
          <button
            class="flex w-full items-center gap-2 rounded-md p-1 text-sm transition-colors hover:bg-accent"
            type="button"
            onclick={() => toggleEntity(item.value)}
          >
            <Icon class="size-4 text-muted-foreground" />
            <span>{item.label}</span>
          </button>
        {/each}
      </div>
    {:else}
      <p class="text-xs italic text-muted-foreground">Все категории выбраны.</p>
    {/if}
  </div>
</div>
