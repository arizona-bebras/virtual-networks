<script lang="ts">
import { Monitor, Shield, SquarePen, Tag, Trash2 } from "@lucide/svelte";
import type { Node } from "@xyflow/svelte";

export type ContextMenuKind = "pane" | "tag" | "rule" | "device";

export type ContextMenuAction =
  | { type: "create-tag" }
  | { type: "create-device" }
  | { type: "create-rule" }
  | { type: "edit-tag"; node: Node }
  | { type: "delete-tag"; node: Node }
  | { type: "edit-rule"; node: Node }
  | { type: "delete-rule"; node: Node }
  | { type: "edit-device"; node: Node };

let {
  x,
  y,
  kind,
  node,
  onaction,
  onclose,
}: {
  x: number;
  y: number;
  kind: ContextMenuKind;
  node?: Node;
  onaction: (action: ContextMenuAction) => void;
  onclose: () => void;
} = $props();

function dispatch(action: ContextMenuAction) {
  onaction(action);
  onclose();
}
</script>

<svelte:window onclick={onclose} onkeydown={(e) => e.key === "Escape" && onclose()} />

<div
  role="menu"
  tabindex="-1"
  class="fixed z-50 min-w-[168px] rounded-xl border border-border bg-background/95 backdrop-blur shadow-2xl p-1"
  style="left: {x}px; top: {y}px;"
  onclick={(e) => e.stopPropagation()}
  onkeydown={(e) => e.stopPropagation()}
>
  {#if kind === "pane"}
    <button
      class="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium hover:bg-accent cursor-pointer transition-colors"
      onclick={() => dispatch({ type: "create-tag" })}
    >
      <Tag size={13} class="text-muted-foreground" /> Новый тег
    </button>
    <button
      class="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium hover:bg-accent cursor-pointer transition-colors"
      onclick={() => dispatch({ type: "create-device" })}
    >
      <Monitor size={13} class="text-muted-foreground" /> Новое устройство
    </button>
    <div class="my-1 h-px bg-border mx-1"></div>
    <button
      class="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium hover:bg-accent cursor-pointer transition-colors"
      onclick={() => dispatch({ type: "create-rule" })}
    >
      <Shield size={13} class="text-muted-foreground" /> Новое правило
    </button>
  {:else if kind === "tag" && node}
    <button
      class="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium hover:bg-accent cursor-pointer transition-colors"
      onclick={() => dispatch({ type: "edit-tag", node })}
    >
      <SquarePen size={13} class="text-muted-foreground" /> Редактировать
    </button>
    <button
      class="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium hover:bg-accent text-destructive cursor-pointer transition-colors"
      onclick={() => dispatch({ type: "delete-tag", node })}
    >
      <Trash2 size={13} /> Удалить тег
    </button>
  {:else if kind === "rule" && node}
    <button
      class="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium hover:bg-accent cursor-pointer transition-colors"
      onclick={() => dispatch({ type: "edit-rule", node })}
    >
      <SquarePen size={13} class="text-muted-foreground" /> Редактировать
    </button>
    <button
      class="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium hover:bg-accent text-destructive cursor-pointer transition-colors"
      onclick={() => dispatch({ type: "delete-rule", node })}
    >
      <Trash2 size={13} /> Удалить правило
    </button>
  {:else if kind === "device" && node}
    <button
      class="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium hover:bg-accent cursor-pointer transition-colors"
      onclick={() => dispatch({ type: "edit-device", node })}
    >
      <SquarePen size={13} class="text-muted-foreground" /> Редактировать
    </button>
  {/if}
</div>
