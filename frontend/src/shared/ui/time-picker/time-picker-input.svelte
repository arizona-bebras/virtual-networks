<script lang="ts">
import { cn } from "$shared/lib/utils.js";

let {
  isRange = false,
  times = $bindable(),
  activeTarget = $bindable(),
  view = $bindable(),
}: {
  isRange?: boolean;
  times: {
    single: { h: number; m: number };
    start: { h: number; m: number };
    end: { h: number; m: number };
  };
  activeTarget: "single" | "start" | "end";
  view: "hours" | "minutes";
} = $props();

function getStr(val: number) {
  return val.toString().padStart(2, "0");
}

function updateTime(
  target: "single" | "start" | "end",
  type: "h" | "m",
  val: number,
) {
  let finalVal = val;
  if (Number.isNaN(finalVal)) finalVal = 0;
  if (finalVal < 0) finalVal = 0;
  if (type === "h" && finalVal > 23) finalVal = 23;
  if (type === "m" && finalVal > 59) finalVal = 59;
  times[target][type] = finalVal;
}

function handleInput(
  e: Event,
  target: "single" | "start" | "end",
  type: "h" | "m",
) {
  const el = e.target as HTMLInputElement;
  el.value = el.value.replace(/\D/g, "").slice(0, 2);
  if (el.value.length === 2) {
    updateTime(target, type, parseInt(el.value, 10));
    // Auto-focus next
    if (type === "h") {
      document.getElementById(`${target}-m-input`)?.focus();
    } else if (target === "start") {
      document.getElementById("end-h-input")?.focus();
    }
  }
}

function handleChange(
  e: Event,
  target: "single" | "start" | "end",
  type: "h" | "m",
) {
  const el = e.target as HTMLInputElement;
  updateTime(target, type, parseInt(el.value, 10));
  el.value = getStr(times[target][type]);
}
</script>

<div class="flex h-full w-full items-center justify-center gap-2">
  {#if !isRange}
    <!-- SINGLE MODE INPUTS -->
    <div class="flex items-center gap-2">
      <div class="flex flex-col items-center gap-1">
        <input
          id="single-h-input"
          type="text"
          inputmode="numeric"
          class={cn(
            "h-14 w-18 rounded-xl border-2 bg-muted/30 text-center text-4xl font-medium outline-none transition-all duration-200",
            view === "hours"
              ? "border-secondary bg-secondary/5 text-secondary ring-2 ring-secondary/10"
              : "border-transparent text-foreground/80 hover:bg-muted/50"
          )}
          value={getStr(times.single.h)}
          onfocus={() => { activeTarget = "single"; view = "hours"; }}
          oninput={(e) => handleInput(e, "single", "h")}
          onchange={(e) => handleChange(e, "single", "h")}
          onblur={(e) => handleChange(e, "single", "h")}
        >
        <span
          class="text-[9px] uppercase tracking-widest text-muted-foreground font-bold"
        >
          Часы
        </span>
      </div>

      <span
        class="text-2xl font-light text-muted-foreground/50 self-start mt-3"
      >
        :
      </span>

      <div class="flex flex-col items-center gap-1">
        <input
          id="single-m-input"
          type="text"
          inputmode="numeric"
          class={cn(
            "h-14 w-18 rounded-xl border-2 bg-muted/30 text-center text-4xl font-medium outline-none transition-all duration-200",
            view === "minutes"
              ? "border-secondary bg-secondary/5 text-secondary ring-2 ring-secondary/10"
              : "border-transparent text-foreground/80 hover:bg-muted/50"
          )}
          value={getStr(times.single.m)}
          onfocus={() => { activeTarget = "single"; view = "minutes"; }}
          oninput={(e) => handleInput(e, "single", "m")}
          onchange={(e) => handleChange(e, "single", "m")}
          onblur={(e) => handleChange(e, "single", "m")}
        >
        <span
          class="text-[9px] uppercase tracking-widest text-muted-foreground font-bold"
        >
          Минуты
        </span>
      </div>
    </div>
  {:else}
    <!-- RANGE MODE INPUTS -->
    <div class="flex items-center gap-1.5">
      <div
        class="flex items-center p-1 rounded-xl bg-muted/20 border border-border/50"
      >
        <input
          id="start-h-input"
          type="text"
          inputmode="numeric"
          class={cn(
            "h-9 w-9 rounded-lg text-center text-lg font-bold outline-none transition-colors duration-200",
            activeTarget === "start" && view === "hours" ? "bg-secondary text-secondary-foreground shadow-sm" : "bg-transparent text-foreground/70"
          )}
          value={getStr(times.start.h)}
          onfocus={() => { activeTarget = "start"; view = "hours"; }}
          oninput={(e) => handleInput(e, "start", "h")}
          onchange={(e) => handleChange(e, "start", "h")}
          onblur={(e) => handleChange(e, "start", "h")}
        >
        <span class="text-base font-light text-muted-foreground mx-0.5">:</span>
        <input
          id="start-m-input"
          type="text"
          inputmode="numeric"
          class={cn(
            "h-9 w-9 rounded-lg text-center text-lg font-bold outline-none transition-colors duration-200",
            activeTarget === "start" && view === "minutes" ? "bg-secondary text-secondary-foreground shadow-sm" : "bg-transparent text-foreground/70"
          )}
          value={getStr(times.start.m)}
          onfocus={() => { activeTarget = "start"; view = "minutes"; }}
          oninput={(e) => handleInput(e, "start", "m")}
          onchange={(e) => handleChange(e, "start", "m")}
          onblur={(e) => handleChange(e, "start", "m")}
        >
      </div>

      <span class="text-muted-foreground/40 font-light text-sm">—</span>

      <div
        class="flex items-center p-1 rounded-xl bg-muted/20 border border-border/50"
      >
        <input
          id="end-h-input"
          type="text"
          inputmode="numeric"
          class={cn(
            "h-9 w-9 rounded-lg text-center text-lg font-bold outline-none transition-colors duration-200",
            activeTarget === "end" && view === "hours" ? "bg-secondary text-secondary-foreground shadow-sm" : "bg-transparent text-foreground/70"
          )}
          value={getStr(times.end.h)}
          onfocus={() => { activeTarget = "end"; view = "hours"; }}
          oninput={(e) => handleInput(e, "end", "h")}
          onchange={(e) => handleChange(e, "end", "h")}
          onblur={(e) => handleChange(e, "end", "h")}
        >
        <span class="text-base font-light text-muted-foreground mx-0.5">:</span>
        <input
          id="end-m-input"
          type="text"
          inputmode="numeric"
          class={cn(
            "h-9 w-9 rounded-lg text-center text-lg font-bold outline-none transition-colors duration-200",
            activeTarget === "end" && view === "minutes" ? "bg-secondary text-secondary-foreground shadow-sm" : "bg-transparent text-foreground/70"
          )}
          value={getStr(times.end.m)}
          onfocus={() => { activeTarget = "end"; view = "minutes"; }}
          oninput={(e) => handleInput(e, "end", "m")}
          onchange={(e) => handleChange(e, "end", "m")}
          onblur={(e) => handleChange(e, "end", "m")}
        >
      </div>
    </div>
  {/if}
</div>
