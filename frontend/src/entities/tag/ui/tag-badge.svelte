<script lang="ts">
import type { DeviceRelations } from "common/schemas/device/index";
import { colorVariants } from "$shared/lib/tag-color-mapping";
import { Badge } from "$shared/ui/badge/index";

let {
  tag,
  onclick,
}: { tag: DeviceRelations["tags"][number]; onclick?: (name: string) => void } =
  $props();
let color = $derived(colorVariants[tag.color || "purple"]);
</script>

<Badge
  variant="secondary"
  class="text-[10px] border {color.backgroundColor} {color.borderColor} {onclick ? 'cursor-pointer hover:brightness-75 transition-all' : ''}"
  style=""
  onclick={() => onclick?.(tag.name)}
>
  {tag.name}
</Badge>
