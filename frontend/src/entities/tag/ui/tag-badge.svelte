<script lang="ts">
import { Tag } from "@lucide/svelte";
import type { DeviceRelations } from "common/schemas/device/index";
import { colorVariants } from "$shared/lib/tag-color-mapping";
import { Badge } from "$shared/ui/badge/index";

let {
  tag,
  onclick,
  isIcon = false,
}: {
  tag: DeviceRelations["tags"][number];
  onclick?: (name: string) => void;
  isIcon?: boolean;
} = $props();
let color = $derived(colorVariants[tag.color || "purple"]);
</script>

<Badge
  variant="secondary"
  class="text-[12px] {isIcon ? 'py-3' : ''} font-medium border rounded-[4px] {color.textColor} {color.backgroundColor} {color.borderColor} {onclick ? 'cursor-pointer hover:brightness-75 transition-all' : ''}"
  style=""
  onclick={() => onclick?.(tag.name)}
>
  {#if isIcon}
    <Tag class="size-4.5" />
  {/if}
  {tag.name}
</Badge>
