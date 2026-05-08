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
      Add Tag
    </Button>
  </Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Add Tag</Dialog.Title>
      <Dialog.Description>
        Create a new tag to group your devices.
      </Dialog.Description>
    </Dialog.Header>
    <TagForm bind:dialogState={open} />
  </Dialog.Content>
</Dialog.Root>
