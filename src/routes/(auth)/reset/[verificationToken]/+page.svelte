<script lang="ts">
	import { navigating } from '$app/stores';

	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';

	import { TriangleAlert, Loader2 } from 'lucide-svelte';

	import { superForm } from 'sveltekit-superforms';

	export let data;

	const form = superForm(data.form, {});

	const { form: formData, message, enhance, delayed } = form;
</script>

{#if !data.tokenExists}
	<Card.Header class="flex flex-col items-center gap-2 text-center">
		<TriangleAlert class="text-muted-foreground" />
		<Card.Description>
			Vaši žádost o resetování hesla nebylo možné zpracovat. Zkontrolujte, zda máte v prohlížeči
			povoleny soubory cookie, a zkuste to znovu.
		</Card.Description>
	</Card.Header>
{:else if !data.tokenValid}
	<Card.Header class="flex flex-col items-center gap-2 text-center">
		<TriangleAlert class="text-muted-foreground" />
		<Card.Description>Zadaný odkaz pro resetování hesla je neplatný.</Card.Description>
	</Card.Header>
{:else}
	<Card.Header class="p-0 pb-8">
		<Card.Title tag="h1" class="text-2xl font-bold">Resetovat heslo</Card.Title>
	</Card.Header>

	<form method="POST" use:enhance class="flex flex-col gap-4">
		<div class="flex flex-col gap-1">
			<Form.Field {form} name="password">
				<Form.Control let:attrs>
					<Form.Label>Heslo</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData.password}
						type="password"
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

		<div class="flex flex-col gap-1">
			<Form.Field {form} name="confirmPassword">
				<Form.Control let:attrs>
					<Form.Label>Potvrďte heslo</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData.confirmPassword}
						type="password"
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
		>
			{#if $delayed}
				<Loader2 class="animate-spin-slow" />
			{:else}
				Pokračovat
			{/if}
		</Form.Button>
	</form>
{/if}
