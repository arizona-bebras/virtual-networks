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

const loginQuery = createMutation(() => ({
  mutationKey: ["login"],
  mutationFn: async (data: z.infer<typeof formSchema>) => {
    const { data: responseData, error } = await authClient.signIn.email({
      email: data.mail,
      password: data.password,
      rememberMe: true,
    });

    if (!error) {
      goto("/app");
      return responseData;
    }

    throw new Error(error.message || "Ошибка входа");
  },
}));

const {
  forms: form,
  valid,
  enhance,
  formData,
} = useForm(formSchema, {
  onSubmit: async () => {
    await loginQuery?.mutateAsync($formData);
  },
});
</script>

<Card.Root class="w-full max-w-md">
  <Card.Header>
    <Card.Title class="text-2xl">Вход</Card.Title>
    <Card.Description>
      Введите вашу почту и пароль для доступа к аккаунту.
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
            <Form.Label>Пароль</Form.Label>
            <Input {...props} type="password" bind:value={$formData.password} />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>

      <Button
        type="submit"
        class="w-full rounded-[6px]"
        disabled={!valid() || loginQuery.isPending}
      >
        {#if loginQuery.isPending}
          <LoaderCircle class="mr-2 h-4 w-4 animate-spin " />
        {/if}
        Войти
      </Button>
    </form>
  </Card.Content>
  <Card.Footer class="flex flex-col space-y-2">
    <div class="text-sm text-center text-muted-foreground">
      Нет аккаунта? <a
        href="/auth/register"
        class="text-secondary hover:underline"
      >
        Зарегистрироваться
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
