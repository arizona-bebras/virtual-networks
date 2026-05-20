<script lang="ts">
import { Checkbox } from "$shared/ui/checkbox/index.js";

let { checked, onCheckedChange, ariaLabel } = $props();
</script>

<Checkbox
  {checked}
  {onCheckedChange}
  aria-label={ariaLabel}
  class="mx-auto my-auto "
/>
