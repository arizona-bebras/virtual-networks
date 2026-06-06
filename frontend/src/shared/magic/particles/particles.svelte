<script lang="ts">
import { onDestroy, onMount } from "svelte";

let {
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = "#ffffff",
  class: className = "",
} = $props<{
  quantity?: number;
  staticity?: number;
  ease?: number;
  size?: number;
  refresh?: boolean;
  color?: string;
  class?: string;
}>();

let canvasContainerRef: HTMLDivElement;
let canvasRef: HTMLCanvasElement;
let context: CanvasRenderingContext2D | null = null;
// biome-ignore lint/suspicious/noExplicitAny: vendored component
let circles: any[] = [];
let mouse = { x: 0, y: 0 };
let canvasSize = { w: 0, h: 0 };
const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;

onMount(() => {
  if (canvasRef) {
    context = canvasRef.getContext("2d");
  }
  initCanvas();
  animate();
  window.addEventListener("resize", initCanvas);
});

onDestroy(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", initCanvas);
  }
});

function initCanvas() {
  resizeCanvas();
  drawParticles();
}

function onMouseMove(event: MouseEvent) {
  if (canvasContainerRef) {
    const rect = canvasContainerRef.getBoundingClientRect();
    const { clientX, clientY } = event;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    mouse.x = x * dpr;
    mouse.y = y * dpr;
  }
}

function resizeCanvas() {
  if (canvasContainerRef && canvasRef && context) {
    circles = [];
    canvasSize.w = canvasContainerRef.offsetWidth;
    canvasSize.h = canvasContainerRef.offsetHeight;
    canvasRef.width = canvasSize.w * dpr;
    canvasRef.height = canvasSize.h * dpr;
    canvasRef.style.width = `${canvasSize.w}px`;
    canvasRef.style.height = `${canvasSize.h}px`;
    context.scale(dpr, dpr);
  }
}

function circleParams() {
  const x = Math.floor(Math.random() * canvasSize.w);
  const y = Math.floor(Math.random() * canvasSize.h);
  const translateX = 0;
  const translateY = 0;
  const pSize = Math.floor(Math.random() * 2) + size;
  const alpha = 0;
  const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
  const dx = (Math.random() - 0.5) * 0.1;
  const dy = (Math.random() - 0.5) * 0.1;
  const magnetism = 0.1 + Math.random() * 4;
  return {
    x,
    y,
    translateX,
    translateY,
    size: pSize,
    alpha,
    targetAlpha,
    dx,
    dy,
    magnetism,
  };
}

// biome-ignore lint/suspicious/noExplicitAny: vendored component
function drawCircle(circle: any, update = false) {
  if (context) {
    const { x, y, translateX, translateY, size, alpha } = circle;
    context.translate(translateX, translateY);
    context.beginPath();
    context.arc(x, y, size, 0, 2 * Math.PI);
    context.fillStyle = `rgba(${hexToRgb(color)}, ${alpha})`;
    context.fill();
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!update) {
      circles.push(circle);
    }
  }
}

function hexToRgb(hex: string): string {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function drawParticles() {
  for (let i = 0; i < quantity; i++) {
    const circle = circleParams();
    drawCircle(circle);
  }
}

function remapValue(
  value: number,
  start1: number,
  end1: number,
  start2: number,
  end2: number,
): number {
  const remapped =
    ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
  return remapped > 0 ? remapped : 0;
}

function animate() {
  if (context) {
    context.clearRect(0, 0, canvasSize.w, canvasSize.h);
    // biome-ignore lint/suspicious/noExplicitAny: vendored component
    circles.forEach((circle: any, i: number) => {
      const edge = [
        circle.x + circle.translateX - circle.size,
        canvasSize.w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        canvasSize.h - circle.y - circle.translateY - circle.size,
      ];
      const closestEdge = edge.reduce((a, b) => Math.min(a, b));
      const remapClosestEdge = parseFloat(
        remapValue(closestEdge, 0, 20, 0, 1).toFixed(2),
      );
      if (remapClosestEdge > 1) {
        circle.alpha += 0.02;
        if (circle.alpha > circle.targetAlpha) {
          circle.alpha = circle.targetAlpha;
        }
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge;
      }
      circle.x += circle.dx;
      circle.y += circle.dy;
      circle.translateX +=
        (mouse.x / (staticity / circle.magnetism) - circle.translateX) / ease;
      circle.translateY +=
        (mouse.y / (staticity / circle.magnetism) - circle.translateY) / ease;

      if (
        circle.x < -circle.size ||
        circle.x > canvasSize.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > canvasSize.h + circle.size
      ) {
        circles.splice(i, 1);
        const newCircle = circleParams();
        drawCircle(newCircle);
      } else {
        drawCircle(
          {
            ...circle,
            x: circle.x,
            y: circle.y,
            translateX: circle.translateX,
            translateY: circle.translateY,
            alpha: circle.alpha,
          },
          true,
        );
      }
    });
  }
  requestAnimationFrame(animate);
}
</script>

<div
  bind:this={canvasContainerRef}
  class="pointer-events-none absolute inset-0 {className}"
  aria-hidden="true"
  onmousemove={onMouseMove}
>
  <canvas bind:this={canvasRef}></canvas>
</div>
