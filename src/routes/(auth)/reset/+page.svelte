<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';

	import { TriangleAlert } from 'lucide-svelte';

	import { superForm } from 'sveltekit-superforms';

	export let data;

	const form = superForm(data.form, {
		resetForm: false
	});
	const { form: formData, message, enhance } = form;

	// form steps
	let emailSubmitted = false;
</script>

{#if !emailSubmitted}
	<Card.Header class="space-y-4 p-0 pb-8">
		<Card.Title tag="h1" class="text-2xl font-bold">Resetovat heslo</Card.Title>
		<Card.Description
			>Zadejte e-mail, pod kterým jste se registrovali a my vám zašleme odkaz pro resetování hesla.</Card.Description
		>
	</Card.Header>

	<form
		method="POST"
		use:enhance
		class="flex flex-col gap-4"
		on:submit={() => (emailSubmitted = true)}
	>
		<div class="flex flex-col gap-1">
			<Form.Field {form} name="email">
				<Form.Control let:attrs>
					<Form.Label>E-mail</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData.email}
						type="email"
						class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			{#if $message}
				<div class="flex items-center gap-2 text-sm text-destructive font-medium">
					<TriangleAlert size="16" />
					<span>{$message}</span>
				</div>
			{/if}
		</div>

		<Form.Button
			class="w-full text-white focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
			>Pokračovat</Form.Button
		>
		<Button variant="link" href="/login" class="h-auto p-0 hover:no-underline hover:text-black">
			Zpět na přihlášení
		</Button>
	</form>
{:else}
	<Card.Header class="space-y-4 p-0">
		<Card.Title tag="h1" class="text-2xl font-bold">Zkontrolujte svůj email</Card.Title>
		<Card.Description
			>Děkujeme! Pokud e-mail <strong>{$formData.email}</strong> evidujeme v naší databázi, tak jsme
			vám zaslali email obsahující další instrukce pro resetování vašeho hesla.</Card.Description
		>
		<Card.Description
			>Pokud jste e-mail neobdrželi do 5 minut, zkontrolujte spam,
			<Button variant="link" class="h-auto p-0 hover:no-underline hover:text-black"
				>odešlete jej znovu</Button
			> nebo <Button
				variant="link"
				class="h-auto p-0 hover:no-underline hover:text-black"
				on:click={() => (emailSubmitted = false)}>zkuste jiný e-mail</Button
			>.
		</Card.Description>
	</Card.Header>
{/if}
