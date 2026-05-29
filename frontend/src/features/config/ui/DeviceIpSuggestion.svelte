<script lang="ts">
import type { ValidationResult } from "../model/types";

let {
  info,
}: {
  info: ValidationResult | null;
} = $props();
</script>

{#if info && !info.isValid}
  <p class="text-[0.8rem] font-medium text-destructive mt-2">
    Октет {info.error.octetIndex} должен быть
    {#if info.error.suggestion.lower === info.error.suggestion.upper}
      {info.error.suggestion.lower}
    {:else}
      от {info.error.suggestion.lower} до {info.error.suggestion.upper}
    {/if}
  </p>
{/if}
