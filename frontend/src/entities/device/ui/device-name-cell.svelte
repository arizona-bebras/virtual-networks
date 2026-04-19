<script lang="ts">
import { Monitor } from "@lucide/svelte";

let { name } = $props();
</script>

<div class="flex items-center gap-3">
  <Monitor class="size-4 text-muted-foreground" />
  <span class="font-medium">{name}</span>
</div>
