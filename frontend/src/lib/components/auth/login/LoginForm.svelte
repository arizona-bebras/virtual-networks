<script lang="ts">
import { LoaderCircle } from "@lucide/svelte";
import { createMutation } from "@tanstack/svelte-query";
import SuperDebug from "sveltekit-superforms";
import type { z } from "zod/v4";
import { PUBLIC_API_URL } from "$env/static/public";
import * as Form from "$lib/components/ui/form/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { useForm } from "$lib/components/useForm.svelte";
import { formSchema } from "../login/schema";

const loginQuery = createMutation(() => ({
  mutationKey: ["login"],
  mutationFn: async (
    data: z.infer<typeof formSchema>,
  ): Promise<Record<string, string>> => {
    const response = await fetch(`${PUBLIC_API_URL}/auth`, {
      method: "POST",
      body: JSON.stringify({
        email: $formData.mail,
        password: $formData.password,
      }),
    });
    const responseData = await response.json();
    if (response.ok) {
      return responseData;
    } else {
      throw new Error(responseData?.error);
    }
  },
}));

const {
  forms: form,
  valid,
  enhance,
  formData,
} = useForm(formSchema, loginQuery);
</script>

<div class="w-112.5 rounded-lg bg-gray-400 p-6">
  <p>Авторизация</p>
  <p class="mb-2 text-[12px]">
    Введите свой логин и пароль для входа в свой аккаунт
  </p>
  <form method="POST" use:enhance class="">
    <Form.Field {form} name="mail">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Почта</Form.Label>
          <Input {...props} bind:value={$formData.mail} />
        {/snippet}
      </Form.Control>
      <!-- <Form.Description>This is your public display name.</Form.Description> -->
      <Form.FieldErrors color="text-green" />
    </Form.Field>
    <Form.Field {form} name="password">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Пароль</Form.Label>
          <Input {...props} bind:value={$formData.password} />
        {/snippet}
      </Form.Control>
      <!-- <Form.Description>This is your public display name.</Form.Description> -->
      <Form.FieldErrors />
    </Form.Field>
    <div class="flex items-center gap-1">
      <Form.Button disabled={!valid || loginQuery.isPending}>Войти</Form.Button>
      {#if loginQuery.isPending}
        <LoaderCircle class="animate-spin" />
      {/if}
    </div>
    {#if loginQuery.isError}
      <p class="text-red-500">Ошибка регистрации: {loginQuery.error.message}</p>
    {/if}
  </form>
</div>

{#if import.meta.env.DEV}
  <SuperDebug data={$formData} />
{/if}
