<script lang="ts">
import { LoaderCircle } from "@lucide/svelte";
import { createMutation } from "@tanstack/svelte-query";
import SuperDebug, { defaults, superForm } from "sveltekit-superforms";
import { zod4, zod4Client } from "sveltekit-superforms/adapters";
import type { z } from "zod/v4";
import { goto } from "$app/navigation";
import { API_URL } from "$env/static/private";
import * as Form from "$lib/components/ui/form/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { useForm } from "$lib/components/useForm.svelte";
import { type FormSchema, formSchema } from "../register/schema";

const registerQuery = createMutation(() => ({
  mutationKey: ["register"],
  mutationFn: async (data: z.infer<typeof formSchema>) => {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      body: JSON.stringify({
        email: data.mail,
        password: data.password,
      }),
    });
    const responseData = await response.json();
    if (response.ok) {
      return data;
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
} = useForm(formSchema, registerQuery);
</script>

<div class="w-112.5 rounded-lg bg-gray-400 p-6">
  <p>Регистрация</p>
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
      <Form.FieldErrors />
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
      <Form.Button disabled={!valid || registerQuery.isPending}>
        Войти
      </Form.Button>
      {#if registerQuery.isPending}
        <LoaderCircle class="animate-spin" />
      {/if}
    </div>
    {#if registerQuery.isError}
      <p class="text-red-500">
        Ошибка регистрации: {registerQuery.error.message}
      </p>
    {/if}
  </form>
</div>

{#if import.meta.env.DEV}
  <SuperDebug data={$formData} />
{/if}
