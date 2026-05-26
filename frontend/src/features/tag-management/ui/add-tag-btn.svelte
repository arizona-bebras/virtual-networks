<script lang="ts">
import { Plus } from "@lucide/svelte";
import TagForm from "$features/tag-management/ui/tag-form.svelte";
import { Button } from "$shared/ui/button/index.js";
import * as Dialog from "$shared/ui/dialog/index.js";

let { open = $bindable() }: { open: boolean } = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    <Button>
      <Plus class="mr-2 size-4" />
      Добавить тег
    </Button>
  </Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Добавить тег</Dialog.Title>
      <Dialog.Description>
        Создайте новый тег для группировки ваших устройств.
      </Dialog.Description>
    </Dialog.Header>
    <TagForm bind:dialogState={open} />
  </Dialog.Content>
</Dialog.Root>
