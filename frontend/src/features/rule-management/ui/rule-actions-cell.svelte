<script lang="ts">
import { Edit, MoreHorizontal, Trash } from "@lucide/svelte";
import { Button } from "$shared/ui/button/index.js";
import * as Dialog from "$shared/ui/dialog/index.js";
import * as DropdownMenu from "$shared/ui/dropdown-menu/index.js";
import type { RuleMock } from "../model/rule-table-columns";
import RuleForm from "./rule-form.svelte";


let { rule }: { rule: RuleMock } = $props();

let isEditDialogOpen = $state(false);


function handleDelete() {
  console.log("Delete rule:", rule.id);
}
</script>

<div class="text-right">
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      <Button variant="ghost" size="icon">
        <MoreHorizontal class="size-4" />
      </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end">
      <DropdownMenu.Item onSelect={() => (isEditDialogOpen = true)}>
        <Edit class="mr-2 size-4" />
        Edit Rule
      </DropdownMenu.Item>
      <DropdownMenu.Item class="text-destructive" onclick={handleDelete}>
        <Trash class="mr-2 size-4" />
        Delete Rule
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>

<Dialog.Root bind:open={isEditDialogOpen}>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Edit Rule</Dialog.Title>
      <Dialog.Description>
        Update the details for this network rule.
      </Dialog.Description>
    </Dialog.Header>
    <RuleForm pageData={{...rule}} />
  </Dialog.Content>
</Dialog.Root>
