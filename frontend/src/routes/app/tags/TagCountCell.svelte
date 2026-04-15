<script lang="ts">
import { Badge } from "$lib/components/ui/badge/index.js";

let { count } = $props();
</script>

<Badge variant="secondary">{count} devices</Badge>
