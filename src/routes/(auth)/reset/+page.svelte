<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';

	import { superForm } from 'sveltekit-superforms';

	export let data;

	const form = superForm(data.form);

	const { form: formData, enhance } = form;
</script>

<Card.Header class="p-0 pb-8">
	<Card.Title tag="h1" class="text-2xl font-bold">Resetovat heslo</Card.Title>
	<Card.Description
		>Zadejte e-mail, pod kterým jste se registrovali a my vám zašleme odkaz pro resetování hesla.</Card.Description
	>
</Card.Header>

<form method="POST" use:enhance class="flex flex-col gap-4">
	<Form.Field {form} name="email">
		<Form.Control let:attrs>
			<Form.Label>E-mail</Form.Label>
			<Input {...attrs} bind:value={$formData.email} type="email" />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button class="w-full">Pokračovat</Form.Button>
	<Button variant="link" href="/login" class="h-auto p-0 hover:no-underline hover:text-black">
		Zpět na přihlášení
	</Button>
</form>
