<script lang="ts">
let { status } = $props();
</script>

<div class="flex items-center gap-2">
  <div
    class={`size-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}
  ></div>
  <span class="capitalize">{status}</span>
</div>
