<script lang="ts">
import { ShieldAlert } from "@lucide/svelte";
import type { RuleRelation } from "common/schemas/rule/index";
import RuleForm from "$features/rule-management/ui/rule-form.svelte";
import * as Dialog from "$shared/ui/dialog/index.js";

let {
  open = $bindable(),
  rule,
  title,
  description,
}: {
  open: boolean;
  title: string;
  rule?: RuleRelation;
  description?: string;
} = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header class="flex flex-row items items-center gap-2 mb-1">
      <div class="p-2 border border-muted-foreground bg-secondary rounded-full">
        <ShieldAlert class="size-6.5 stroke-secondary-foreground" />
      </div>
      <div>
        <Dialog.Title class="font-semibold mb-0.5">{title}</Dialog.Title>
        {#if description}
          <Dialog.Description class="text-[12px]" style="line-height:normal">
            {description}
          </Dialog.Description>
        {/if}
      </div>
    </Dialog.Header>
    <RuleForm pageData={rule} bind:dialogState={open} />
  </Dialog.Content>
</Dialog.Root>
