<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { formSchema } from '../register/schema';
	import SuperDebug, { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { createMutation } from '@tanstack/svelte-query';

	const form = superForm(defaults(zod4(formSchema)), {
		SPA: true,
		onSubmit: async () => {
			const request = await registerQuery.mutateAsync();
			if (request) {
				const { token } = request;
				localStorage.setItem('token', token);
				goto('/dashboard');
			}
		},
		validators: zod4Client(formSchema)
	});

	const { form: formData, enhance } = form;

	const registerQuery = createMutation(() => ({
		mutationKey: ['register'],
		mutationFn: async () => {
			const response = await fetch('http://localhost:3000/register', {
				method: 'POST',
				body: JSON.stringify({
					email: $formData.mail,
					password: $formData.password
				})
			});
			const data = await response.json();
			if (response.ok) {
				return data;
			} else {
				throw new Error(data?.error);
			}
		}
	}));
</script>

<div class="w-112.5 rounded-lg bg-gray-400 p-6">
	<p>Регистрация</p>
	<p class="mb-2 text-[12px]">Введите свой логин и пароль для входа в свой аккаунт</p>
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
		<Form.Button>Войти</Form.Button>
	</form>
</div>

{#if import.meta.env.DEV}
	<SuperDebug data={$formData} />
{/if}
