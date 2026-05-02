<script lang="ts">
import type { TagColor } from "common/schemas/tag/index";
import { colorVariants } from "$shared/lib/tag-color-mapping";

let { name, color }: { name: string; color: TagColor | null } = $props();
</script>

<div class="flex items-center gap-2">
  {#if color && colorVariants[color]}
    {@const variants = colorVariants[color]}
    <div
      class={`size-2 rounded-full border ${variants.backgroundColor} ${variants.borderColor}`}
    ></div>
  {/if}
  <span>{name}</span>
</div>
