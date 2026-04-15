<script lang="ts">
import { Badge } from "$lib/components/ui/badge/index.js";

let { icon: Icon } = $props();
</script>

<Badge variant="outline" class="font-mono text-[10px]">
  {Icon?.name || 'Tag'}
</Badge>
