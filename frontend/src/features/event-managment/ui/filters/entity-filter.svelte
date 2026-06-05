<script lang="ts">
import {
  Check,
  MonitorSmartphone,
  RotateCcw,
  Settings,
  Shield,
  Tag,
} from "@lucide/svelte";
import type { Column } from "@tanstack/table-core";
import type { Event } from "common/schemas/event/index";
import { cn } from "$shared/lib/utils.js";

let {
  column,
}: {
  column: Column<Event, unknown>;
} = $props();

const options = [
  {
    value: "device",
    label: "Устройства",
    icon: MonitorSmartphone,
  },
  {
    value: "rule",
    label: "Правила",
    icon: Shield,
  },
  {
    value: "tag",
    label: "Теги",
    icon: Tag,
  },
  {
    value: "network",
    label: "Сеть",
    icon: Settings,
  },
] as const;

let selectedEntities = $derived<string[]>(
  (column.getFilterValue() as string[]) ?? [],
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

function reset() {
  column.setFilterValue(undefined);
}
</script>

<div class="flex min-w-[240px] flex-col gap-2 p-2">
  <!-- Header -->
  <div class="flex items-center justify-between px-1 py-0.5">
    <span
      class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50"
    >
      Категории
    </span>
    {#if selectedEntities.length > 0}
      <button
        type="button"
        onclick={reset}
        class="group flex items-center gap-1 text-[10px] font-semibold text-muted-foreground/70 transition-colors hover:text-foreground"
      >
        <RotateCcw
          class="size-2.5 transition-transform group-hover:-rotate-45"
        />
        Сброс
      </button>
    {/if}
  </div>

  <!-- Options Grid -->
  <div class="grid grid-cols-2 gap-1.5">
    {#each options as { value, label, icon }}
      {@const isSelected = selectedEntities.includes(value)}
      {@const Icon = icon}
      <button
        type="button"
        onclick={() => toggleEntity(value)}
        class={cn(
          "group relative flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all duration-200",
          isSelected
            ? "border-secondary/20 bg-muted/20 shadow-sm"
            : "border-transparent bg-muted/10 hover:bg-muted/40 text-muted-foreground hover:text-foreground",
        )}
      >
        <!-- Top-Left Circle (Icon Container) -->
        <div
          class={cn(
            "flex size-8 items-center justify-center rounded-full transition-all duration-300",
            isSelected
              ? "bg-secondary text-secondary-foreground scale-110 shadow-md ring-2 ring-background"
              : "bg-background text-muted-foreground/40 group-hover:scale-110",
          )}
        >
          <Icon class="size-4" />
        </div>

        <!-- Label -->
        <span
          class={cn(
            "text-xs font-medium transition-colors",
            isSelected ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {label}
        </span>

        <!-- Check Indicator Overlay -->
        {#if isSelected}
          <div
            class="absolute right-1.5 top-1.5 flex size-3.5 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-sm animate-in zoom-in-50 duration-200"
          >
            <Check class="size-2" strokeWidth={4} />
          </div>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Selection Status -->
  <!-- {#if selectedEntities.length > 0}
    <div class="flex items-center justify-center px-1 py-1">
      <p
        class="text-[9px] font-medium text-muted-foreground/40 uppercase tracking-tighter"
      >
        Выбрано: {selectedEntities.length} из {options.length}
      </p>
    </div>
  {:else}
    <p class="text-center text-[10px] italic text-muted-foreground/40 py-1">
      Выберите фильтр
    </p>
  {/if} -->
</div>
