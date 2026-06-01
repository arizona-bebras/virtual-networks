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
      document.getElementById(`end-h-input`)?.focus();
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

<div class="flex h-full w-full items-center justify-center gap-1">
  {#if !isRange}
    <!-- SINGLE MODE INPUTS -->
    <div class="flex flex-col gap-2">
      <input
        id="single-h-input"
        type="text"
        inputmode="numeric"
        class={cn(
          "h-[72px] w-[80px] rounded-t-xl border-b-2 bg-muted/50 text-center text-5xl outline-none transition-colors",
          view === "hours" ? "border-accent bg-accent text-accent-foreground" : "border-muted-foreground focus:border-accent text-foreground"
        )}
        value={getStr(times.single.h)}
        onfocus={() => { activeTarget = "single"; view = "hours"; }}
        oninput={(e) => handleInput(e, "single", "h")}
        onchange={(e) => handleChange(e, "single", "h")}
        onblur={(e) => handleChange(e, "single", "h")}
      >
    </div>
    <span class="mb-2 text-5xl text-foreground mx-1">:</span>
    <div class="flex flex-col gap-2">
      <input
        id="single-m-input"
        type="text"
        inputmode="numeric"
        class={cn(
          "h-[72px] w-[80px] rounded-t-xl border-b-2 bg-muted/50 text-center text-5xl outline-none transition-colors",
          view === "minutes" ? "border-accent bg-accent text-accent-foreground" : "border-muted-foreground focus:border-accent text-foreground"
        )}
        value={getStr(times.single.m)}
        onfocus={() => { activeTarget = "single"; view = "minutes"; }}
        oninput={(e) => handleInput(e, "single", "m")}
        onchange={(e) => handleChange(e, "single", "m")}
        onblur={(e) => handleChange(e, "single", "m")}
      >
    </div>
  {:else}
    <!-- RANGE MODE INPUTS -->
    <div class="flex items-center">
      <input
        id="start-h-input"
        type="text"
        inputmode="numeric"
        class={cn(
          "h-[56px] w-[48px] rounded-t-lg border-b-2 bg-muted/50 text-center text-2xl outline-none transition-colors",
          activeTarget === "start" && view === "hours" ? "border-accent bg-accent text-accent-foreground" : "border-muted-foreground focus:border-accent text-foreground"
        )}
        value={getStr(times.start.h)}
        onfocus={() => { activeTarget = "start"; view = "hours"; }}
        oninput={(e) => handleInput(e, "start", "h")}
        onchange={(e) => handleChange(e, "start", "h")}
        onblur={(e) => handleChange(e, "start", "h")}
      >
      <span class="text-2xl font-normal mx-1 mb-2">:</span>
      <input
        id="start-m-input"
        type="text"
        inputmode="numeric"
        class={cn(
          "h-[56px] w-[48px] rounded-t-lg border-b-2 bg-muted/50 text-center text-2xl outline-none transition-colors",
          activeTarget === "start" && view === "minutes" ? "border-accent bg-accent text-accent-foreground" : "border-muted-foreground focus:border-accent text-foreground"
        )}
        value={getStr(times.start.m)}
        onfocus={() => { activeTarget = "start"; view = "minutes"; }}
        oninput={(e) => handleInput(e, "start", "m")}
        onchange={(e) => handleChange(e, "start", "m")}
        onblur={(e) => handleChange(e, "start", "m")}
      >
    </div>

    <span class="text-xl text-muted-foreground mx-1 mb-2">—</span>

    <div class="flex items-center">
      <input
        id="end-h-input"
        type="text"
        inputmode="numeric"
        class={cn(
          "h-[56px] w-[48px] rounded-t-lg border-b-2 bg-muted/50 text-center text-2xl outline-none transition-colors",
          activeTarget === "end" && view === "hours" ? "border-accent bg-accent text-accent-foreground" : "border-muted-foreground focus:border-accent text-foreground"
        )}
        value={getStr(times.end.h)}
        onfocus={() => { activeTarget = "end"; view = "hours"; }}
        oninput={(e) => handleInput(e, "end", "h")}
        onchange={(e) => handleChange(e, "end", "h")}
        onblur={(e) => handleChange(e, "end", "h")}
      >
      <span class="text-2xl font-normal mx-1 mb-2">:</span>
      <input
        id="end-m-input"
        type="text"
        inputmode="numeric"
        class={cn(
          "h-[56px] w-[48px] rounded-t-lg border-b-2 bg-muted/50 text-center text-2xl outline-none transition-colors",
          activeTarget === "end" && view === "minutes" ? "border-accent bg-accent text-accent-foreground" : "border-muted-foreground focus:border-accent text-foreground"
        )}
        value={getStr(times.end.m)}
        onfocus={() => { activeTarget = "end"; view = "minutes"; }}
        oninput={(e) => handleInput(e, "end", "m")}
        onchange={(e) => handleChange(e, "end", "m")}
        onblur={(e) => handleChange(e, "end", "m")}
      >
    </div>
  {/if}
</div>
