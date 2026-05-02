<script lang="ts">
import { Plus } from "@lucide/svelte";
import RuleForm from "$features/rule-management/ui/rule-form.svelte";
import { Button } from "$shared/ui/button/index.js";
import * as Dialog from "$shared/ui/dialog/index.js";

let { open = $bindable() }: { open: boolean } = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    <Button>
      <Plus class="mr-2 size-4" />
      Add Rule
    </Button>
  </Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Add Rule</Dialog.Title>
      <Dialog.Description>
        Create a new network access control rule.
      </Dialog.Description>
    </Dialog.Header>
    <RuleForm bind:dialogState={open} />
  </Dialog.Content>
</Dialog.Root>
