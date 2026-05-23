<script lang="ts">
import { Badge } from "$shared/ui/badge/index.js";

let { count } = $props();
</script>

<Badge variant="secondary" class="rounded-[6px]">{count} devices</Badge>
