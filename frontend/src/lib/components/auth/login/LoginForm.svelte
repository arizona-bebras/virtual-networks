<script lang="ts">
import { LoaderCircle } from "@lucide/svelte";
import { createMutation } from "@tanstack/svelte-query";
import SuperDebug, { defaults, superForm } from "sveltekit-superforms";
import { zod4, zod4Client } from "sveltekit-superforms/adapters";
import { goto } from "$app/navigation";
import { Button } from "$lib/components/ui/button/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Form from "$lib/components/ui/form/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { formSchema } from "../login/schema";

const form = superForm(defaults(zod4(formSchema)), {
  SPA: true,
  onSubmit: async () => {
    // Mock successful login for now
    localStorage.setItem("token", "mock-token");
    goto("/app/dashboard");
  },
  onChange: async () => {
    let form = await validateForm();
    isFormValid = form.valid;
  },
  validators: zod4Client(formSchema),
});

const { form: formData, enhance, validateForm } = form;

let isFormValid = $state(false);

const loginQuery = createMutation(() => ({
  mutationKey: ["login"],
  mutationFn: async () => {
    const response = await fetch("http://localhost:3000/auth", {
      method: "POST",
      body: JSON.stringify({
        email: $formData.mail,
        password: $formData.password,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data?.error);
    }
  },
}));
</script>

<Card.Root class="w-full max-w-md">
  <Card.Header>
    <Card.Title class="text-2xl">Login</Card.Title>
    <Card.Description>
      Enter your email and password to access your account.
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <form method="POST" use:enhance class="space-y-4">
      <Form.Field {form} name="mail">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Email</Form.Label>
            <Input
              {...props}
              bind:value={$formData.mail}
              placeholder="m@example.com"
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field {form} name="password">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Password</Form.Label>
            <Input {...props} type="password" bind:value={$formData.password} />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>

      <Button
        type="submit"
        class="w-full"
        disabled={!isFormValid || loginQuery.isPending}
      >
        {#if loginQuery.isPending}
          <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        Login
      </Button>
    </form>
  </Card.Content>
  <Card.Footer class="flex flex-col space-y-2">
    <div class="text-sm text-center text-muted-foreground">
      Don't have an account? <a
        href="/auth/register"
        class="text-primary hover:underline"
      >
        Register
      </a>
    </div>
    {#if loginQuery.isError}
      <p class="text-sm text-destructive text-center">
        {loginQuery.error.message}
      </p>
    {/if}
  </Card.Footer>
</Card.Root>

{#if import.meta.env.DEV}
  <div class="mt-8"><SuperDebug data={$formData} /></div>
{/if}
