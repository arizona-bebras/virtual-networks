<script lang="ts">
import type { TagColor } from "common/schemas/tag/index";
import { colorVariants } from "$shared/lib/tag-color-mapping";

let { color }: { color: TagColor } = $props();
let colorObj = $derived(colorVariants[color ?? "gray"]);
</script>

<div class="flex items-center gap-2">
  <div
    class={`size-3 rounded-full border ${colorObj.backgroundColor} ${colorObj.borderColor} -500`}
  ></div>
  <span class="capitalize">{color ?? 123}</span>
</div>
