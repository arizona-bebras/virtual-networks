<script lang="ts">
import * as FormPrimitive from "formsnap";
import { cn, type WithoutChild } from "$shared/lib/utils.js";
import { Label } from "$shared/ui/label/index.js";

let {
  ref = $bindable(null),
  children,
  class: className,
  type = "optional",
  ...restProps
}: WithoutChild<FormPrimitive.LabelProps> & {
  type?: "optional" | "required";
} = $props();
</script>

<FormPrimitive.Label {...restProps} bind:ref>
  {#snippet child({ props })}
    <Label
      {...props}
      data-slot="form-label"
      class={cn('data-[fs-error]:text-destructive font-medium gap-0.5 mb-1 text-[12px]', className)}
    >
      {@render children?.()}
      {#if type === 'required'}
        <p class="text-destructive">*</p>
      {/if}
    </Label>
  {/snippet}
</FormPrimitive.Label>
