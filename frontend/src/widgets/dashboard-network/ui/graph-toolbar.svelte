<script lang="ts">
import { Monitor, Shield, Tag } from "@lucide/svelte";
import { Button } from "$shared/ui/button/index.js";

let {
  onopenTag,
  onopenDevice,
  onopenRule,
}: {
  onopenTag: () => void;
  onopenDevice: () => void;
  onopenRule: () => void;
} = $props();
</script>

<div
  class="fixed bottom-4 left-1/2 z-10 flex gap-1 bg-background/95 backdrop-blur border border-border p-1.5 rounded-2xl shadow-xl"
>
  <div class="flex sm:flex-row flex-col">
    <Button variant="ghost" size="sm" onclick={onopenDevice}>
      <Monitor size={13} class="mr-1" /> Устройство
    </Button>
    <Button variant="ghost" size="sm" onclick={onopenTag}>
      <Tag size={13} class="mr-1" /> Тег
    </Button>
    <Button variant="ghost" size="sm" onclick={onopenRule}>
      <Shield size={13} class="mr-1" /> Правило
    </Button>
  </div>
</div>
