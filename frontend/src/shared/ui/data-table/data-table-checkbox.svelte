<script lang="ts">
import { Checkbox } from "$shared/ui/checkbox/index.js";

let { checked, onCheckedChange, ariaLabel } = $props();
</script>

<div class="min-w-8">
  <Checkbox
    {checked}
    {onCheckedChange}
    aria-label={ariaLabel}
    class="mx-auto my-auto"
  />
</div>
