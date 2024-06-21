<script lang="ts">
	import { navigating } from '$app/stores';

	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	import { TriangleAlert, Loader } from 'lucide-svelte';

	import { superForm } from 'sveltekit-superforms';

	export let data;

	const form = superForm(data.form);

	const { form: formData, message, enhance } = form;
</script>

<Card.Header class="p-0 pb-8">
	<Card.Title tag="h1" class="text-2xl font-bold">Vítejte zpět</Card.Title>
	<Card.Description>Vítejte zpět! Zadejte prosím vaše přihlašovací údaje.</Card.Description>
</Card.Header>

<Card.Content class="p-0">
	<form method="POST" use:enhance class="flex flex-col gap-8">
		<div class="flex flex-col gap-1">
			<div class="flex flex-col gap-4">
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

				<Form.Field {form} name="password">
					<Form.Control let:attrs>
						<div class="flex justify-between items-center">
							<Form.Label>Heslo</Form.Label>
							<Button
								variant="link"
								href="/reset"
								class="h-auto p-0 hover:no-underline hover:text-black">Zapomněli jste heslo?</Button
							>
						</div>
						<Input
							{...attrs}
							bind:value={$formData.password}
							type="password"
							autocomplete="current-password"
							class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
						/>
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			{#if $message}
				<div class="flex items-center gap-2 text-sm text-destructive font-medium">
					<TriangleAlert size="16" />
					<span>{$message}</span>
				</div>
			{/if}
		</div>

		<Form.Button
			class="w-full text-white focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
		>
			{#if $navigating}
				<Loader class="animate-spin-slow" />
			{:else}
				Přihlásit se
			{/if}
		</Form.Button>
	</form>
</Card.Content>
