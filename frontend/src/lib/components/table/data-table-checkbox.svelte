<script lang="ts">
import { Checkbox } from "$lib/components/ui/checkbox/index.js";

let { checked, onCheckedChange, ariaLabel } = $props();
</script>

<Checkbox
  {checked}
  {onCheckedChange}
  aria-label={ariaLabel}
  class="translate-y-[2px]"
/>
