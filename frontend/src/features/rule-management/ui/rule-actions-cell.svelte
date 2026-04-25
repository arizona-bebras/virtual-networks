<script lang="ts">
import { Edit, MoreHorizontal, Trash } from "@lucide/svelte";
import { UpdateRuleSchema } from "common/schemas/rule/update-rule";
import { untrack } from "svelte";
import { z } from "zod";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { Button } from "$shared/ui/button/index.js";
import * as Dialog from "$shared/ui/dialog/index.js";
import * as DropdownMenu from "$shared/ui/dropdown-menu/index.js";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import type { RuleMock } from "../model/rule-table-columns";

let { rule }: { rule: RuleMock } = $props();

let isEditDialogOpen = $state(false);


// TODO: Убрать после изменения формы на backend
const ExtendedUpdateRuleSchema = UpdateRuleSchema.extend({
  description: z.string().min(1, "Description is required"),
});

let {
  forms: form,
  formData,
  valid,
  enhance,
} = useForm(ExtendedUpdateRuleSchema, {
  onSubmit: async () => {
    console.log("Updating rule:", rule.id, $formData);
    isEditDialogOpen = false;
  },
});

$effect(() => {
  if (isEditDialogOpen) {
    untrack(() => {
      $formData.description = rule.description;
      $formData.source = rule.sourceTag;
      $formData.dest = rule.destTag;
      $formData.protocol = rule.protocol;
      $formData.port = Number(rule.port) || undefined;
    });
  }
});

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
    <form method="POST" use:enhance class="space-y-4">
      <Form.Field {form} name="description">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Description</Form.Label>
            <Input {...props} bind:value={$formData.description} />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>

      <div class="grid grid-cols-2 gap-4">
        <Form.Field {form} name="source">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Source Tag</Form.Label>
              <Input {...props} bind:value={$formData.source} />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field {form} name="dest">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Destination Tag</Form.Label>
              <Input {...props} bind:value={$formData.dest} />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <Form.Field {form} name="protocol">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Protocol</Form.Label>
              <Input {...props} bind:value={$formData.protocol} />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field {form} name="port">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Port</Form.Label>
              <Input
                {...props}
                type="number"
                value={$formData.port}
                oninput={(e) => $formData.port = Number(e.currentTarget.value)}
              />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
      </div>

      <Form.Button class="w-full" disabled={!valid()}>Save Changes</Form.Button>
    </form>
  </Dialog.Content>
</Dialog.Root>
