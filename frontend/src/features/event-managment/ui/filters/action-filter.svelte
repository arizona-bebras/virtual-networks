<script lang="ts">
import { Check, Pencil, Plus, RotateCcw, Trash2 } from "@lucide/svelte";
import type { Column } from "@tanstack/table-core";
import type { Event } from "common/schemas/event/index";
import { cn } from "$shared/lib/utils.js";

let {
  column,
}: {
  column: Column<Event, unknown>;
} = $props();

const actionOptions = [
  {
    value: "create",
    label: "Создание",
    description: "Новая запись",
    icon: Plus,
    color: "text-lime-500",
    bg: "bg-lime-500/10",
    border: "border-lime-500/20",
    dot: "bg-lime-500",
  },
  {
    value: "update",
    label: "Обновление",
    description: "Изменение данных",
    icon: Pencil,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    dot: "bg-blue-500",
  },
  {
    value: "delete",
    label: "Уничтожение",
    description: "Удаление сущности",
    icon: Trash2,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    dot: "bg-red-500",
  },
] as const;

let selectedActions = $derived<string[]>(
  (column.getFilterValue() as string[]) ?? [],
);

function toggleAction(value: string) {
  let next: string[];
  if (selectedActions.includes(value)) {
    next = selectedActions.filter((v) => v !== value);
  } else {
    next = [...selectedActions, value];
  }

  column.setFilterValue(next.length > 0 ? next : undefined);
}

function reset() {
  column.setFilterValue(undefined);
}
</script>

<div class="flex min-w-[200px] flex-col gap-1.5 p-1.5">
  <div class="flex items-center justify-between px-2 py-1">
    <span
      class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60"
    >
      Тип действия
    </span>
    {#if selectedActions.length > 0}
      <button
        type="button"
        onclick={reset}
        class="group flex items-center gap-1 text-[10px] font-semibold text-muted-foreground/80 transition-colors hover:text-foreground"
      >
        <RotateCcw
          class="size-2.5 transition-transform group-hover:-rotate-45"
        />
        Сбросить
      </button>
    {/if}
  </div>

  <div class="space-y-1">
    {#each actionOptions as { value, label, description, icon, color, bg, border, dot }}
      {@const isSelected = selectedActions.includes(value)}
      {@const Icon = icon}
      <button
        type="button"
        onclick={() => toggleAction(value)}
        class={cn(
          "relative flex w-full items-center gap-3 rounded-md border p-2 text-left transition-all duration-200",
          isSelected
            ? `${bg} ${border} shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]`
            : "border-transparent hover:bg-muted/50",
        )}
      >
        <!-- Icon/Status -->
        <div
          class={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-300",
            isSelected
              ? `${bg} ${border} scale-100`
              : "border-muted-foreground/10 bg-muted/30 scale-95",
          )}
        >
          <Icon
            class={cn(
              "size-4 transition-all",
              isSelected ? color : "text-muted-foreground/40",
            )}
          />
        </div>

        <!-- Label -->
        <div class="flex flex-col">
          <span
            class={cn(
              "text-sm font-medium transition-colors",
              isSelected ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {label}
          </span>
          <span class="text-[10px] leading-none text-muted-foreground/50">
            {description}
          </span>
        </div>

        <!-- Selected State Indicator -->
        {#if isSelected}
          <div
            class="ml-auto flex size-5 items-center justify-center rounded-full border bg-background shadow-sm"
          >
            <Check class={cn("size-3", color)} strokeWidth={3} />
          </div>
        {/if}

        <!-- Subtle Side Bar -->
        <div
          class={cn(
            "absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full transition-all duration-300",
            isSelected ? dot : "bg-transparent",
          )}
        ></div>
      </button>
    {/each}
  </div>
  <!-- 
  {#if selectedActions.length === 0}
    <div
      class="mt-1 border border-dashed border-muted-foreground/10 bg-muted/20 px-2 py-2 rounded-md"
    >
      <p class="text-center text-[10px] italic text-muted-foreground/60">
        Выберите типы для фильтрации
      </p>
    </div>
  {/if} -->
</div>
