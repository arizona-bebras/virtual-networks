<script lang="ts">
import { Clock, Keyboard } from "@lucide/svelte";
import { cn } from "$shared/lib/utils.js";
import { Button } from "$shared/ui/button/index.js";
import TimePickerDial from "./time-picker-dial.svelte";
import TimePickerInput from "./time-picker-input.svelte";

type RangeValue = { start: Date; end: Date };

let {
  isRange = false,
  value = $bindable(new Date()),
  range = $bindable({ start: new Date(), end: new Date() }),
  onSave,
  onCancel,
}: {
  isRange?: boolean;
  value?: Date;
  range?: RangeValue;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave?: (val: any) => void;
  onCancel?: () => void;
} = $props();

let times = $state({
  single: { h: value?.getHours() || 0, m: value?.getMinutes() || 0 },
  start: {
    h: range?.start?.getHours() || 0,
    m: range?.start?.getMinutes() || 0,
  },
  end: { h: range?.end?.getHours() || 0, m: range?.end?.getMinutes() || 0 },
});

$effect(() => {
  if (!isRange && value) {
    times.single.h = value.getHours();
    times.single.m = value.getMinutes();
  }
});

$effect(() => {
  if (isRange && range) {
    times.start.h = range.start.getHours();
    times.start.m = range.start.getMinutes();
    times.end.h = range.end.getHours();
    times.end.m = range.end.getMinutes();
  }
});

let activeTarget = $state<"single" | "start" | "end">(
  isRange ? "start" : "single",
);
let mode = $state<"dial" | "input">("dial");
let view = $state<"hours" | "minutes">("hours");

function formatTime(val: number) {
  return val.toString().padStart(2, "0");
}

function handleSave() {
  if (isRange) {
    const newStart = new Date(range.start);
    newStart.setHours(times.start.h, times.start.m, 0, 0);
    const newEnd = new Date(range.end);
    newEnd.setHours(times.end.h, times.end.m, 0, 0);
    range = { start: newStart, end: newEnd };
    if (onSave) onSave(range);
  } else {
    const newDate = new Date(value);
    newDate.setHours(times.single.h, times.single.m, 0, 0);
    value = newDate;
    if (onSave) onSave(newDate);
  }
}
</script>

<div
  class="flex flex-col w-[300px] p-5 bg-background rounded-[24px] shadow-lg font-sans select-none"
>
  <!-- Header: Заголовок -->
  <div class="flex justify-between items-center mb-3 min-h-[28px]">
    <span class="text-sm font-medium tracking-wide text-muted-foreground">
      Выберите время
    </span>
  </div>

  {#if mode === "dial"}
    <!-- Header: Большие цифры времени (Dial mode) -->
    {#if !isRange}
      <div class="flex justify-center items-center gap-2 mb-6">
        <button
          type="button"
          class={cn(
            "flex justify-center items-center h-[72px] w-[80px] rounded-xl cursor-pointer transition-colors",
            activeTarget === "single" && view === "hours"
              ? "bg-primary/20 text-primary hover:bg-primary/30"
              : "bg-muted/50 text-foreground hover:bg-muted"
          )}
          onclick={() => { activeTarget = "single"; view = "hours"; }}
        >
          <span class="text-5xl font-normal leading-none">
            {formatTime(times.single.h)}
          </span>
        </button>
        <span class="text-5xl font-normal text-foreground leading-none mb-1">
          :
        </span>
        <button
          type="button"
          class={cn(
            "flex justify-center items-center h-[72px] w-[80px] rounded-xl cursor-pointer transition-colors",
            activeTarget === "single" && view === "minutes"
              ? "bg-primary/20 text-primary hover:bg-primary/30"
              : "bg-muted/50 text-foreground hover:bg-muted"
          )}
          onclick={() => { activeTarget = "single"; view = "minutes"; }}
        >
          <span class="text-5xl font-normal leading-none">
            {formatTime(times.single.m)}
          </span>
        </button>
      </div>
    {:else}
      <div class="flex justify-center items-center gap-1 mb-6">
        <!-- Start -->
        <div class="flex items-center">
          <button
            type="button"
            class={cn(
              "flex justify-center items-center h-[56px] w-[48px] rounded-lg cursor-pointer transition-colors",
              activeTarget === "start" && view === "hours" ? "bg-primary/20 text-foreground/50" : "bg-muted/50 text-foreground"
            )}
            onclick={() => { activeTarget = "start"; view = "hours"; }}
          >
            <span class="text-2xl font-normal leading-none">
              {formatTime(times.start.h)}
            </span>
          </button>
          <span class="text-2xl font-normal mx-1 mb-1">:</span>
          <button
            type="button"
            class={cn(
              "flex justify-center items-center h-[56px] w-[48px] rounded-lg cursor-pointer transition-colors",
              activeTarget === "start" && view === "minutes" ? "bg-primary/20 text-foreground/50" : "bg-muted/50 text-foreground"
            )}
            onclick={() => { activeTarget = "start"; view = "minutes"; }}
          >
            <span class="text-2xl font-normal leading-none">
              {formatTime(times.start.m)}
            </span>
          </button>
        </div>

        <span class="text-xl text-muted-foreground mx-1 mb-1">—</span>

        <!-- End -->
        <div class="flex items-center">
          <button
            type="button"
            class={cn(
              "flex justify-center items-center h-[56px] w-[48px] rounded-lg cursor-pointer transition-colors",
              activeTarget === "end" && view === "hours" ? "bg-primary/20 text-foreground/50" : "bg-muted/50 text-foreground"
            )}
            onclick={() => { activeTarget = "end"; view = "hours"; }}
          >
            <span class="text-2xl font-normal leading-none">
              {formatTime(times.end.h)}
            </span>
          </button>
          <span class="text-2xl font-normal mx-1 mb-1">:</span>
          <button
            type="button"
            class={cn(
              "flex justify-center items-center h-[56px] w-[48px] rounded-lg cursor-pointer transition-colors",
              activeTarget === "end" && view === "minutes" ? "bg-primary/20 text-foreground/50" : "bg-muted/50 text-foreground"
            )}
            onclick={() => { activeTarget = "end"; view = "minutes"; }}
          >
            <span class="text-2xl font-normal leading-none">
              {formatTime(times.end.m)}
            </span>
          </button>
        </div>
      </div>
    {/if}
  {/if}

  <!-- Content: Dial or Input -->
  <div class="flex justify-center min-h-[220px]">
    {#if mode === "dial"}
      <TimePickerDial
        bind:hours={times[activeTarget].h}
        bind:minutes={times[activeTarget].m}
        bind:view
      />
    {:else}
      <div class="flex items-start pt-4">
        <TimePickerInput {isRange} bind:times bind:activeTarget bind:view />
      </div>
    {/if}
  </div>

  <!-- Footer: Кнопки действий -->
  <div class="flex justify-between items-center mt-6">
    <Button
      variant="ghost"
      size="icon"
      class="rounded-full text-muted-foreground hover:text-foreground"
      onclick={() => (mode = mode === "dial" ? "input" : "dial")}
    >
      {#if mode === "dial"}
        <Keyboard class="size-6" />
      {:else}
        <Clock class="size-6" />
      {/if}
      <span class="sr-only">Переключить режим ввода</span>
    </Button>
    <div class="flex gap-2">
      <Button
        class="bg-secondary! text-primary font-medium px-4 rounded-[6px]"
        onclick={onCancel}
      >
        Отмена
      </Button>
      <Button
        class="bg-secondary! text-primary font-medium px-4 rounded-[6px]"
        onclick={handleSave}
      >
        Применить
      </Button>
    </div>
  </div>
</div>
