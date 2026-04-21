<script lang="ts">
import { LoaderCircle } from "@lucide/svelte";
import { createMutation } from "@tanstack/svelte-query";
import SuperDebug from "sveltekit-superforms";
import type { z } from "zod/v4";
import { goto } from "$app/navigation";
import { authClient } from "$shared/api/auth-client.js";
import { useForm } from "$shared/lib/forms/use-form.svelte";
import { Button } from "$shared/ui/button/index.js";
import * as Card from "$shared/ui/card/index.js";
import * as Form from "$shared/ui/form/index.js";
import { Input } from "$shared/ui/input/index.js";
import { formSchema } from "../model/schema.js";

const registerQuery = createMutation(() => ({
  mutationKey: ["register"],
  mutationFn: async (data: z.infer<typeof formSchema>) => {
    const { data: requestData, error } = await authClient.signUp.email({
      name: data.username,
      email: data.mail,
      password: data.password,
    });

    if (!error) {
      goto("/app/dashboard");
      return requestData;
    }

    throw new Error(error.message || "Ошибка регистрации");
  },
}));

const {
  forms: form,
  valid,
  enhance,
  formData,
} = useForm(formSchema, {onSubmit: async () => {
    await registerQuery?.mutateAsync($formData);
  }});
</script>

<Card.Root class="w-full max-w-md">
  <Card.Header>
    <Card.Title class="text-2xl">Register</Card.Title>
    <Card.Description>
      Create an account to manage your virtual networks.
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <form method="POST" use:enhance class="space-y-4">
      <Form.Field {form} name="username">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Username</Form.Label>
            <Input
              {...props}
              bind:value={$formData.username}
              placeholder="Username"
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
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
            <Input
              {...props}
              type="password"
              bind:value={$formData.password}
              placeholder="********"
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>

      <Button
        type="submit"
        class="w-full"
        disabled={!valid() || registerQuery.isPending}
      >
        {#if registerQuery.isPending}
          <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        Register
      </Button>
    </form>
  </Card.Content>
  <Card.Footer class="flex flex-col space-y-2">
    <div class="text-sm text-center text-muted-foreground">
      Already have an account? <a
        href="/auth/login"
        class="text-primary hover:underline"
      >
        Login
      </a>
    </div>
    {#if registerQuery.isError}
      <p class="text-sm text-destructive text-center">
        {registerQuery.error.message}
      </p>
    {/if}
  </Card.Footer>
</Card.Root>

{#if import.meta.env.DEV}
  <div class="mt-8"><SuperDebug data={$formData} /></div>
{/if}
