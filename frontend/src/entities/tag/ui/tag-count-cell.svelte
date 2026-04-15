<script lang="ts">
import { Badge } from "$shared/ui/badge/index.js";

let { count } = $props();
</script>

<Badge variant="secondary">{count} devices</Badge>
