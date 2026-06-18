<script lang="ts">
import { Shield, Tag } from "@lucide/svelte";
import { onClickOutside } from "runed";
import { Button } from "$shared/ui/button/index.js";

type SuggestionKind = "tag" | "rule" | null;

let {
  x,
  y,
  fromNodeType,
  fromNodeId,
  onclose,
  oncreateTag,
  oncreateRule,
}: {
  x: number;
  y: number;
  fromNodeType: string;
  fromNodeId: string;
  onclose: () => void;
  oncreateTag: () => void;
  oncreateRule: (initial: { sourceId?: string; destId?: string }) => void;
} = $props();

const POPUP_WIDTH = 200;
const POPUP_HEIGHT = 100;
const OFFSET = 12;

let container = $state<HTMLElement>()!;
onClickOutside(
  () => container,
  () => {
    onclose();
  },
);

let left = $derived(Math.min(x + OFFSET, window.innerWidth - POPUP_WIDTH - 8));
let top = $derived(Math.min(y + OFFSET, window.innerHeight - POPUP_HEIGHT - 8));

let kind: SuggestionKind = $derived(
  fromNodeType === "device" ? "tag" : fromNodeType === "tag" ? "rule" : null,
);

let label = $derived(
  kind === "tag" ? "Создать тег" : kind === "rule" ? "Создать правило" : null,
);

function handleAction() {
  if (kind === "tag") {
    oncreateTag();
  } else if (kind === "rule") {
    if (fromNodeId.startsWith("source-")) {
      oncreateRule({ sourceId: fromNodeId.slice("source-".length) });
    } else if (fromNodeId.startsWith("dest-")) {
      oncreateRule({ destId: fromNodeId.slice("dest-".length) });
    } else {
      oncreateRule({});
    }
  }
}
</script>

<svelte:window
  onmousedown={onclose}
  onkeydown={(e) => e.key === "Escape" && onclose()}
/>

{#if kind}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    bind:this={container}
    role="tooltip"
    class="fixed z-50 flex flex-col gap-1.5 rounded-xl border border-border bg-background/95 backdrop-blur-md p-2.5 shadow-2xl"
    style="left: {left}px; top: {top}px; width: {POPUP_WIDTH}px;"
    onmousedown={(e) => e.stopPropagation()}
  >
    <p
      class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-0.5"
    >
      Привязать к...
    </p>
    <Button
      variant="outline"
      class="w-full justify-start gap-2 h-8 text-xs font-medium"
      onclick={handleAction}
    >
      {#if kind === "tag"}
        <div class="p-1 rounded-md bg-emerald-500/15">
          <Tag class="size-3 text-emerald-500" />
        </div>
      {:else}
        <div class="p-1 rounded-md bg-amber-500/15">
          <Shield class="size-3 text-amber-500" />
        </div>
      {/if}
      {label}
    </Button>
  </div>
{/if}
