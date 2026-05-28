<script lang="ts">
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  type LucideIcon,
} from "@lucide/svelte";
import type { SortDirection } from "@tanstack/table-core";
import { Button } from "$shared/ui/button/index.js";

let {
  label,
  onclick,
  icon,
  sort,
}: {
  label: string;
  onclick: () => void;
  icon: LucideIcon;
  sort: false | SortDirection;
} = $props();

let Icon = $derived(icon);
</script>

<Button
  variant="ghost"
  {onclick}
  class="w-full flex justify-between px-2 h-8 data-[state=open]:bg-accent"
>
  <div class="flex items-center gap-1">
    {#if Icon}
      <Icon class="mb-1" />
    {/if}
    <span>{label}</span>
  </div>
  {#if sort === "asc"}
    <ArrowUp class="ml-2 size-3" />
  {:else if sort === "desc"}
    <ArrowDown class="ml-2 size-3" />
  {:else}
    <ArrowUpDown class="ml-2 size-3" />
  {/if}
</Button>
