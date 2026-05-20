<script lang="ts">
import { ArrowUpDown, type LucideIcon } from "@lucide/svelte";
import { Button } from "$shared/ui/button/index.js";

let {
  label,
  onclick,
  icon,
}: { label: string; onclick: () => void; icon: LucideIcon } = $props();

let Icon = $derived(icon);
</script>

<Button
  variant="ghost"
  {onclick}
  class="w-full flex justify-between px-2 h-8 data-[state=open]:bg-accent"
>
  <div class="flex items-center gap-1">
    {#if Icon}
      <Icon class="mb-1"/>
    {/if}
    <span>{label}</span>
  </div>
  <ArrowUpDown class="ml-2 size-3" />
</Button>
