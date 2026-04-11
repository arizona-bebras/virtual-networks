<script lang="ts">
import { LoaderCircle } from "@lucide/svelte";
import { createMutation } from "@tanstack/svelte-query";
import SuperDebug, { defaults, superForm } from "sveltekit-superforms";
import { zod4, zod4Client } from "sveltekit-superforms/adapters";
import { goto } from "$app/navigation";
import * as Form from "$lib/components/ui/form/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { formSchema } from "../register/schema";

const form = superForm(defaults(zod4(formSchema)), {
  SPA: true,
  onSubmit: async () => {
    const request = await registerQuery.mutateAsync();
    if (request) {
      const { token } = request;
      localStorage.setItem("token", token);
      goto("/app");
    }
  },
  onChange: async () => {
    let form = await validateForm();
    isFormValid = form.valid;
  },
  validators: zod4Client(formSchema),
});

const { form: formData, enhance, validateForm } = form;

let isFormValid = $state(false);

const registerQuery = createMutation(() => ({
  mutationKey: ["register"],
  mutationFn: async () => {
    const response = await fetch("http://localhost:3000/register", {
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
      <Form.Button disabled={!isFormValid || registerQuery.isPending}>
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
