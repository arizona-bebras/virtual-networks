<script lang="ts">
import type { DeviceRelations } from "common/schemas/device/index";
import type { TagColor } from "common/schemas/tag/index";
import { colorVariants } from "$shared/lib/tag-color-mapping";
import { Badge } from "$shared/ui/badge/index.js";

let { tags }: { tags: DeviceRelations["tags"] } = $props();
</script>

<div class="flex flex-wrap gap-1">
  {#each tags as tag}
    {@const color = colorVariants[tag.color ?? 'purple']}
    <Badge
      variant="secondary"
      class="text-[10px] border {color.backgroundColor} {color.borderColor} {onclick ? 'cursor-pointer hover:brightness-75 transition-all' : ''}"
      style=""
      onclick={() => onclick?.(tag.name)}
    >
      {tag.name}
    </Badge>
  {/each}
</div>
