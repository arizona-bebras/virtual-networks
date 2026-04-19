<script lang="ts">
import SidebarIcon from "phosphor-svelte/lib/Sidebar";
import type { ComponentProps } from "svelte";
import { cn } from "$shared/lib/utils.js";
import { Button } from "$shared/ui/button/index.js";
import { useSidebar } from "./context.svelte.js";

let {
  ref = $bindable(null),
  class: className,
  onclick,
  ...restProps
}: ComponentProps<typeof Button> & {
  onclick?: (e: MouseEvent) => void;
} = $props();

const sidebar = useSidebar();
</script>

<Button
  bind:ref
  data-sidebar="trigger"
  data-slot="sidebar-trigger"
  variant="ghost"
  size="icon-sm"
  class={cn('cn-sidebar-trigger', className)}
  type="button"
  onclick={(e) => {
		onclick?.(e);
		sidebar.toggle();
	}}
  {...restProps}
>
  <SidebarIcon />
  <span class="sr-only">Toggle Sidebar</span>
</Button>
