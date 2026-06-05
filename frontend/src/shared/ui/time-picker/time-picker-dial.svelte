<script lang="ts">
import { cn } from "$shared/lib/utils.js";
import { getAngle, getDistance, roundToNearest } from "./utils.js";

let {
  hours = $bindable(),
  minutes = $bindable(),
  view = $bindable(),
}: {
  hours: number;
  minutes: number;
  view: "hours" | "minutes";
} = $props();

const DIAL_SIZE = 180;
const CENTER = DIAL_SIZE / 2;
const OUTER_RADIUS = 72;
const INNER_RADIUS = 44;

let isDragging = $state(false);
let dialRef: HTMLDivElement | null = null;

// Часы: внешнее кольцо 1-12, внутреннее 13-23 и 0
const hourNumbers = Array.from({ length: 24 }, (_, i) => i);
const minuteNumbers = Array.from({ length: 12 }, (_, i) => i * 5);

let pointerData = $derived(
  (() => {
    const isHour = view === "hours";
    const value = isHour ? hours : minutes;
    let radius = OUTER_RADIUS;

    if (isHour) {
      radius = value > 0 && value <= 12 ? OUTER_RADIUS : INNER_RADIUS;
    }

    let angle = 0;
    if (isHour) {
      angle = (value % 12) * 30;
    } else {
      angle = value * 6;
    }

    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: CENTER + radius * Math.cos(rad),
      y: CENTER + radius * Math.sin(rad),
      radius,
      angle,
    };
  })(),
);

function getNumberCoords(value: number, isHour: boolean) {
  let radius = OUTER_RADIUS;
  let angle = 0;

  if (isHour) {
    radius = value > 0 && value <= 12 ? OUTER_RADIUS : INNER_RADIUS;
    angle = (value % 12) * 30;
  } else {
    angle = value * 6;
  }

  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

function handlePointerEvent(e: PointerEvent) {
  if (!dialRef) return;
  const rect = dialRef.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const rawAngle = getAngle(CENTER, CENTER, x, y);
  const distance = getDistance(CENTER, CENTER, x, y);

  if (view === "hours") {
    const angle = roundToNearest(rawAngle, 30);
    let val = Math.round(angle / 30);
    if (val === 12) val = 0; // 0 degrees is 12 or 0

    const threshold = (OUTER_RADIUS + INNER_RADIUS) / 2;
    const isOuter = distance > threshold;

    if (isOuter) {
      hours = val === 0 ? 12 : val;
    } else {
      hours = val === 0 ? 0 : val + 12;
    }
  } else {
    const angle = roundToNearest(rawAngle, 6);
    let val = Math.round(angle / 6);
    if (val === 60) val = 0;
    minutes = val;
  }
}

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0 && e.button !== -1) return; // Only left click or touch
  isDragging = true;
  dialRef?.setPointerCapture(e.pointerId);
  handlePointerEvent(e);
}

function onPointerMove(e: PointerEvent) {
  if (isDragging) {
    handlePointerEvent(e);
  }
}

function onPointerUp(e: PointerEvent) {
  if (isDragging) {
    handlePointerEvent(e);
    isDragging = false;
    dialRef?.releasePointerCapture(e.pointerId);
    if (view === "hours") {
      view = "minutes";
    }
  }
}
</script>

<div
  class="relative rounded-full bg-muted/40 touch-none shadow-inner border border-border/50"
  style="width: {DIAL_SIZE}px; height: {DIAL_SIZE}px;"
  bind:this={dialRef}
  role="presentation"
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
>
  <!-- Decorative dial ticks -->
  <div
    class="absolute inset-3 rounded-full border border-dashed border-border/30 pointer-events-none"
  ></div>

  <!-- Center dot -->
  <div
    class="absolute bg-secondary rounded-full shadow-sm z-20"
    style="width: 4px; height: 4px; top: {CENTER - 2}px; left: {CENTER - 2}px;"
  ></div>

  <!-- Pointer Group -->
  <div
    class={cn(
      "absolute pointer-events-none",
      !isDragging && "transition-transform duration-200 ease-out"
    )}
    style="
      top: {CENTER}px; 
      left: {CENTER}px; 
      transform: rotate({pointerData.angle}deg);
    "
  >
    <!-- Pointer line -->
    <div
      class={cn(
        "absolute bg-secondary/40 origin-bottom",
        !isDragging && "transition-all duration-200 ease-out"
      )}
      style="
        width: 1.5px;
        height: {pointerData.radius - 2}px;
        left: -0.75px;
        bottom: 0;
      "
    ></div>

    <!-- Pointer circle (selection thumb) -->
    <div
      class={cn(
        "absolute bg-secondary rounded-full flex items-center justify-center shadow-md z-10",
        !isDragging && "transition-all duration-200 ease-out"
      )}
      style="
        width: {view === 'hours' || minutes % 5 === 0 ? 26 : 8}px; 
        height: {view === 'hours' || minutes % 5 === 0 ? 26 : 8}px; 
        left: -{view === 'hours' || minutes % 5 === 0 ? 13 : 4}px;
        top: -{pointerData.radius + (view === 'hours' || minutes % 5 === 0 ? 13 : 4)}px;
      "
    ></div>
  </div>

  <!-- Numbers -->
  {#if view === "hours"}
    {#each hourNumbers as h}
      {@const coords = getNumberCoords(h, true)}
      {@const isSelected = hours === h}
      <span
        class={cn(
          "absolute text-[10px] font-bold flex justify-center items-center pointer-events-none transition-colors duration-200 z-20",
          isSelected ? "text-secondary-foreground" : "text-foreground/70"
        )}
        style="width: 24px; height: 24px; top: {coords.y - 12}px; left: {coords.x - 12}px;"
      >
        {h === 0 ? "00" : h.toString()}
      </span>
    {/each}
  {:else}
    {#each minuteNumbers as m}
      {@const coords = getNumberCoords(m, false)}
      {@const isSelected = minutes === m}
      <span
        class={cn(
          "absolute text-[10px] font-bold flex justify-center items-center pointer-events-none transition-colors duration-200 z-20",
          isSelected ? "text-secondary-foreground" : "text-foreground/70"
        )}
        style="width: 24px; height: 24px; top: {coords.y - 12}px; left: {coords.x - 12}px;"
      >
        {m.toString().padStart(2, "0")}
      </span>
    {/each}
  {/if}
</div>
