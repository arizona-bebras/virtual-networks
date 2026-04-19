<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn, type WithElementRef } from "$shared/lib/utils.js";

let {
  ref = $bindable(null),
  class: className,
  children,
  ...restProps
}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
  bind:this={ref}
  data-slot="card-footer"
  class={cn("rounded-none border-t p-4 group-data-[size=sm]/card:p-2 flex items-center", className)}
  {...restProps}
>
  {@render children?.()}
</div>
