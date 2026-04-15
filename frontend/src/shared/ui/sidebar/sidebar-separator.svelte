<script lang="ts">
import type { ComponentProps } from "svelte";
import { cn } from "$shared/lib/utils.js";
import { Separator } from "$shared/ui/separator/index.js";

let {
  ref = $bindable(null),
  class: className,
  ...restProps
}: ComponentProps<typeof Separator> = $props();
</script>

<Separator
  bind:ref
  data-slot="sidebar-separator"
  data-sidebar="separator"
  class={cn('mx-2 w-auto bg-sidebar-border', className)}
  {...restProps}
/>
