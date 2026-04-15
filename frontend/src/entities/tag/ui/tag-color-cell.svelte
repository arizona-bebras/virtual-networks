<script lang="ts">
let { color } = $props();
</script>

<div class="flex items-center gap-2">
  <div class={`size-3 rounded-full bg-${color}-500`}></div>
  <span class="capitalize">{color}</span>
</div>
