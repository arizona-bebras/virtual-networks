<script lang="ts">
import type { Separator as SeparatorPrimitive } from "bits-ui";
import { cn } from "$shared/lib/utils.js";
import { Separator } from "$shared/ui/separator/index.js";

let {
  ref = $bindable(null),
  class: className,
  ...restProps
}: SeparatorPrimitive.RootProps = $props();
</script>

<Separator
  bind:ref
  data-slot="select-separator"
  class={cn("bg-border -mx-1 h-px pointer-events-none", className)}
  {...restProps}
/>
