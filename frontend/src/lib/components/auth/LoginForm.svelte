<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { formSchema } from './schema';
	import SuperDebug, {
		type SuperValidated,
		type Infer,
		superForm,
		defaults
	} from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { zod4Client } from 'sveltekit-superforms/adapters';

	const form = superForm(defaults(zod4(formSchema)), {
		SPA: true,
		onSubmit: async () => {
			console.log('Form submitted with data:', $formData);
			sessionStorage.setItem('isAuthenticated', 'true');
			document.cookie = "isAuthenticated=true; path=/";
			goto('/dashboard');
		},
		validators: zod4Client(formSchema)
	});

	const { form: formData, enhance } = form;
</script>

<div class="bg-gray-400 p-6 rounded-lg">
  <p>Авторизация</p>
  <p class="text-[12px] mb-2">Введите свой логин и пароль для входа в свой аккаунт</p>
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
