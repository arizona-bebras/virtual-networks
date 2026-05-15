<script lang="ts">
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
    <Dialog.Header>
      <Dialog.Title>{title}</Dialog.Title>
      {#if description}
        <Dialog.Description>{description}</Dialog.Description>
      {/if}
    </Dialog.Header>
    <RuleForm pageData={rule} bind:dialogState={open} />
  </Dialog.Content>
</Dialog.Root>
