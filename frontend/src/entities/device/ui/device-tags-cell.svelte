<script lang="ts">
import type { DeviceRelations } from "common/schemas/device/index";
import type { TagColor } from "common/schemas/tag/index";
import TagBadge from "$entities/tag/ui/tag-badge.svelte";
import { colorVariants } from "$shared/lib/tag-color-mapping";
import { Badge } from "$shared/ui/badge/index.js";

let {
  tags,
  onclick,
  excludedTags,
}: {
  tags: DeviceRelations["tags"];
  onclick?: (name: string) => void;
  excludedTags?: DeviceRelations["tags"];
} = $props();
</script>

<div class="flex flex-wrap gap-1">
  {#each tags as tag (tag.id)}
    {@const isExcluded = excludedTags?.some((filterTag) => filterTag.name === tag.name)}
    <div class={isExcluded ? "opacity-40 pointer-events-none select-none" : ""}>
      <TagBadge
        {tag}
        onclick={isExcluded ? undefined : () => onclick?.(tag.name)}
      />
    </div>
  {/each}
</div>
