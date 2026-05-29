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
      Добавить правило
    </Button>
  </Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Добавить правило</Dialog.Title>
      <Dialog.Description>
        Создайте новое правило контроля доступа к сети
      </Dialog.Description>
    </Dialog.Header>
    <RuleForm bind:dialogState={open} />
  </Dialog.Content>
</Dialog.Root>
