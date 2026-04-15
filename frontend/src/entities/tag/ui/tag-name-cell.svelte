<script lang="ts">
import type { Component } from "svelte";

let { name, icon: Icon, color } = $props();
</script>

<div class="flex items-center gap-3">
  <Icon class="size-4" style={`color: var(--color-${color}-500);`} />
  <span class="font-medium">{name}</span>
</div>
