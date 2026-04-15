<script lang="ts">
import { Badge } from "$lib/components/ui/badge/index.js";

let { tags } = $props();
</script>

<div class="flex flex-wrap gap-1">
  {#each tags as tag}
    <Badge variant="secondary" class="text-[10px]">{tag}</Badge>
  {/each}
</div>
