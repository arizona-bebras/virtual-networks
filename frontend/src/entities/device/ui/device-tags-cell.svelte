<script lang="ts">
import type { DeviceRelations } from "common/schemas/device/index";
import { Badge } from "$shared/ui/badge/index.js";

let { tags }: { tags: DeviceRelations["tags"] } = $props();

const colorVariants = {
  red: {
    backgroundColor: "bg-red-500/25",
    borderColor: "border-red-500",
  },
  blue: {
    backgroundColor: "bg-blue-500/25",
    borderColor: "border-blue-500",
  },
  green: {
    backgroundColor: "bg-green-500/25",
    borderColor: "border-green-500",
  },
  yellow: {
    backgroundColor: "bg-yellow-500/25",
    borderColor: "border-yellow-500",
  },
  purple: {
    backgroundColor: "bg-purple-500/25",
    borderColor: "border-purple-500",
  },
  orange: {
    backgroundColor: "bg-orange-500/25",
    borderColor: "border-orange-500",
  },
};
</script>

<div class="flex flex-wrap gap-1">
  {#each tags as tag}
    {@const color = colorVariants[tag.color ?? 'purple']}
    <Badge
      variant="secondary"
      class="text-[10px] border {color.backgroundColor} {color.borderColor}"
      style=""
    >
      {tag.name}
    </Badge>
  {/each}
</div>
