<script lang="ts">
import { Plus } from "@lucide/svelte";
import { CreateRuleSchema } from "common/schemas/rule/create-rule";
import { z } from "zod";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { Button } from "$shared/ui/button/index.js";
import * as Dialog from "$shared/ui/dialog/index.js";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";

let { open = $bindable() }: { open: boolean } = $props();


// TODO: Убрать после изменения формы на backend
const ExtendedCreateRuleSchema = CreateRuleSchema.extend({
  description: z.string().min(1, "Description is required"),
});

let {
  forms: form,
  formData,
  valid,
  enhance,
} = useForm(ExtendedCreateRuleSchema, {
  onSubmit: async () => {
    console.log("Adding new rule:", $formData);
    open = false;
  },
});
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
    <form method="POST" use:enhance class="space-y-4">
      <Form.Field {form} name="description">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Description</Form.Label>
            <Input
              {...props}
              bind:value={$formData.description}
              placeholder="Allow SSH"
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>

      <div class="grid grid-cols-2 gap-4">
        <Form.Field {form} name="source">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Source Tag</Form.Label>
              <Input
                {...props}
                bind:value={$formData.source}
                placeholder="admin"
              />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field {form} name="dest">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Destination Tag</Form.Label>
              <Input
                {...props}
                bind:value={$formData.dest}
                placeholder="servers"
              />
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
              <Input
                {...props}
                bind:value={$formData.protocol}
                placeholder="tcp"
              />
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
                placeholder="22"
              />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
      </div>

      <Form.Button class="w-full" disabled={!valid()}>Create Rule</Form.Button>
    </form>
  </Dialog.Content>
</Dialog.Root>
