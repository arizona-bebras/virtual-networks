<script lang="ts">
import { ArrowUpDown } from "lucide-svelte";
import { Button } from "$lib/components/ui/button/index.js";

let { label, onclick } = $props();
</script>

<Button variant="ghost" {onclick} class="-ml-4 h-8 data-[state=open]:bg-accent">
  <span>{label}</span>
  <ArrowUpDown class="ml-2 h-4 w-4" />
</Button>
