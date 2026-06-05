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
  onSave?: (val: { start: Date; end: Date }) => void;
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
  // svelte-ignore state_referenced_locally
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
  }
  // else {
  //   const newDate = new Date(value);
  //   newDate.setHours(times.single.h, times.single.m, 0, 0);
  //   value = newDate;
  //   if (onSave) onSave(newDate);
  // }
}
</script>

<div class="flex flex-col w-[260px] p-3 select-none">
  <!-- Header: Заголовок -->
  <div class="flex justify-between items-center mb-4">
    <span
      class="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
    >
      Выбор времени
    </span>
    <div class="h-0.5 w-6 bg-border rounded-full opacity-50"></div>
  </div>

  {#if mode === "dial"}
    <!-- Header: Большие цифры времени (Dial mode) -->
    {#if !isRange}
      <div class="flex justify-center items-center gap-2 mb-6">
        <button
          type="button"
          class={cn(
            "flex flex-col justify-center items-center h-16 w-20 rounded-xl cursor-pointer transition-all duration-300",
            activeTarget === "single" && view === "hours"
              ? "bg-secondary text-secondary-foreground shadow-md scale-105"
              : "bg-muted/30 text-foreground/70 hover:bg-muted/50"
          )}
          onclick={() => { activeTarget = "single"; view = "hours"; }}
        >
          <span class="text-4xl font-bold leading-none tracking-tighter">
            {formatTime(times.single.h)}
          </span>
          <span class="text-[7px] uppercase font-black opacity-50 mt-0.5">
            Hour
          </span>
        </button>

        <span class="text-3xl font-light text-muted-foreground/30 leading-none">
          :
        </span>

        <button
          type="button"
          class={cn(
            "flex flex-col justify-center items-center h-16 w-20 rounded-xl cursor-pointer transition-all duration-300",
            activeTarget === "single" && view === "minutes"
              ? "bg-secondary text-secondary-foreground shadow-md scale-105"
              : "bg-muted/30 text-foreground/70 hover:bg-muted/50"
          )}
          onclick={() => { activeTarget = "single"; view = "minutes"; }}
        >
          <span class="text-4xl font-bold leading-none tracking-tighter">
            {formatTime(times.single.m)}
          </span>
          <span class="text-[7px] uppercase font-black opacity-50 mt-0.5">
            Min
          </span>
        </button>
      </div>
    {:else}
      <div class="flex justify-center items-center gap-1.5 mb-6">
        <!-- Start -->
        <div
          class="flex items-center p-0.5 rounded-xl bg-muted/20 border border-border"
        >
          <button
            type="button"
            class={cn(
              "flex justify-center items-center h-10 w-10 rounded-lg cursor-pointer transition-all duration-200",
              activeTarget === "start" && view === "hours" ? "bg-secondary text-secondary-foreground shadow-sm" : "bg-transparent text-foreground/70"
            )}
            onclick={() => { activeTarget = "start"; view = "hours"; }}
          >
            <span class="text-xl font-bold leading-none">
              {formatTime(times.start.h)}
            </span>
          </button>
          <span class="text-lg font-light text-muted-foreground/40 mx-0.5">
            :
          </span>
          <button
            type="button"
            class={cn(
              "flex justify-center items-center h-10 w-10 rounded-lg cursor-pointer transition-all duration-200",
              activeTarget === "start" && view === "minutes" ? "bg-secondary text-secondary-foreground shadow-sm" : "bg-transparent text-foreground/70"
            )}
            onclick={() => { activeTarget = "start"; view = "minutes"; }}
          >
            <span class="text-xl font-bold leading-none">
              {formatTime(times.start.m)}
            </span>
          </button>
        </div>

        <span class="text-muted-foreground/30 font-light text-xs">—</span>

        <!-- End -->
        <div
          class="flex items-center p-0.5 rounded-xl bg-muted/20 border border-border"
        >
          <button
            type="button"
            class={cn(
              "flex justify-center items-center h-10 w-10 rounded-lg cursor-pointer transition-all duration-200",
              activeTarget === "end" && view === "hours" ? "bg-secondary text-secondary-foreground shadow-sm" : "bg-transparent text-foreground/70"
            )}
            onclick={() => { activeTarget = "end"; view = "hours"; }}
          >
            <span class="text-xl font-bold leading-none">
              {formatTime(times.end.h)}
            </span>
          </button>
          <span class="text-lg font-light text-muted-foreground/40 mx-0.5">
            :
          </span>
          <button
            type="button"
            class={cn(
              "flex justify-center items-center h-10 w-10 rounded-lg cursor-pointer transition-all duration-200",
              activeTarget === "end" && view === "minutes" ? "bg-secondary text-secondary-foreground shadow-sm" : "bg-transparent text-foreground/70"
            )}
            onclick={() => { activeTarget = "end"; view = "minutes"; }}
          >
            <span class="text-xl font-bold leading-none">
              {formatTime(times.end.m)}
            </span>
          </button>
        </div>
      </div>
    {/if}
  {/if}

  <!-- Content: Dial or Input -->
  <div class="flex justify-center items-center min-h-[200px]">
    {#if mode === "dial"}
      <TimePickerDial
        bind:hours={times[activeTarget].h}
        bind:minutes={times[activeTarget].m}
        bind:view
      />
    {:else}
      <div class="flex items-center w-full">
        <TimePickerInput {isRange} bind:times bind:activeTarget bind:view />
      </div>
    {/if}
  </div>

  <!-- Footer: Кнопки действий -->
  <div
    class="flex justify-between items-center mt-6 pt-3 border-t border-border"
  >
    <Button
      variant="ghost"
      size="icon"
      class="rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-secondary transition-all"
      onclick={() => (mode = mode === "dial" ? "input" : "dial")}
    >
      {#if mode === "dial"}
        <Keyboard class="size-4" />
      {:else}
        <Clock class="size-4" />
      {/if}
      <span class="sr-only">Переключить режим ввода</span>
    </Button>

    <div class="flex gap-1.5">
      <Button
        class="bg-secondary text-secondary-foreground text-[10px] font-black uppercase tracking-widest px-4 rounded-[6px] shadow-lg hover:shadow-secondary/20 transition-all active:scale-95"
        onclick={handleSave}
      >
        Применить
      </Button>
    </div>
  </div>
</div>
