<script lang="ts">
import { Plus } from "@lucide/svelte";
import { createMutation, getQueryClientContext } from "@tanstack/svelte-query";
import { CreateNetworkSchema } from "common/schemas/network/create-network";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import * as Dialog from "$shared/ui/dialog/index.js";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import { headerQueries } from "../api/query.js";

const queryClient = getQueryClientContext()

const query = createMutation(() => headerQueries.createNetworkMutation(queryClient));

let { isDialogOpen = $bindable() }: { isDialogOpen: boolean } = $props();

let {
  forms: form,
  formData,
  valid,
  enhance,
} = useForm(CreateNetworkSchema, {
  onSubmit: async () => {
    query.mutate({
      name: $formData.name,
      description: $formData.description,
      cidr: $formData.cidr,
    });
    isDialogOpen = false;
  },
});
</script>

<Dialog.Root bind:open={isDialogOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Создание сети</Dialog.Title>
      <Dialog.Description>
        Заполните форму ниже, чтобы создать новую виртуальную сеть.
      </Dialog.Description>
    </Dialog.Header>
    <form method="POST" use:enhance>
      <Form.Field {form} name="name">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Название</Form.Label>
            <Input {...props} bind:value={$formData.name} />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field {form} name="description">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Описание</Form.Label>
            <Input {...props} bind:value={$formData.description} />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field {form} name="cidr">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>CIDR</Form.Label>
            <Input
              {...props}
              bind:value={$formData.cidr}
              placeholder="192.168.1.0/24"
            />
          {/snippet}
        </Form.Control>

        <Form.FieldErrors />
      </Form.Field>
      <Form.Button disabled={!valid() || query.isPending}>
        <Plus class="mr-2 size-4" />
        <span>Создать сеть</span>
      </Form.Button>
    </form>
  </Dialog.Content>
</Dialog.Root>
