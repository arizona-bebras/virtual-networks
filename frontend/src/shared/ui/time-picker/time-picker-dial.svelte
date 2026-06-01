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

const DIAL_SIZE = 220;
const CENTER = DIAL_SIZE / 2;
const OUTER_RADIUS = 90;
const INNER_RADIUS = 56;

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
  class="relative rounded-full bg-muted/50 touch-none"
  style="width: {DIAL_SIZE}px; height: {DIAL_SIZE}px;"
  bind:this={dialRef}
  role="presentation"
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
>
  <!-- Center dot -->
  <div
    class="absolute bg-accent rounded-full"
    style="width: 8px; height: 8px; top: {CENTER - 4}px; left: {CENTER - 4}px;"
  ></div>

  <!-- Pointer line -->
  <div
    class="absolute bg-secondary pointer-events-none"
    style="
      width: 2px;
      height: {Math.max(0, pointerData.radius - 10)}px;
      bottom: 50%;
      left: calc(50% - 1px);
      transform-origin: bottom center;
      transform: rotate({pointerData.angle}deg);
    "
  ></div>

  <!-- Pointer circle (selection thumb) -->
  <div
    class="absolute bg-secondary rounded-full flex items-center justify-center pointer-events-none"
    style="width: 20px; height: 20px; top: {pointerData.y - 10}px; left: {pointerData.x - 10}px;"
  >
    <!-- Если выбор попадает не точно на нарисованную цифру минут (например, 12 минут), показываем маленький кружок -->
    {#if view === "minutes" && minutes % 5 !== 0}
      <div class="w-2 h-2 bg-accent-foreground rounded-full"></div>
    {/if}
  </div>

  <!-- Numbers -->
  {#if view === "hours"}
    {#each hourNumbers as h}
      {@const coords = getNumberCoords(h, true)}
      <span
        class={cn(
          "absolute text-sm font-medium flex justify-center items-center pointer-events-none",
          hours === h ? "text-primary-foreground z-10" : "text-foreground"
        )}
        style="width: 32px; height: 32px; top: {coords.y - 16}px; left: {coords.x - 16}px;"
      >
        {h === 0 ? "00" : h.toString()}
      </span>
    {/each}
  {:else}
    {#each minuteNumbers as m}
      {@const coords = getNumberCoords(m, false)}
      <span
        class={cn(
          "absolute text-sm font-medium flex justify-center items-center pointer-events-none",
          minutes === m ? "text-primary-foreground z-10" : "text-foreground"
        )}
        style="width: 32px; height: 32px; top: {coords.y - 16}px; left: {coords.x - 16}px;"
      >
        {m.toString().padStart(2, "0")}
      </span>
    {/each}
  {/if}
</div>
