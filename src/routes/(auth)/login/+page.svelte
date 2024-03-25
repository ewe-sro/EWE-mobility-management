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

<Card.Content class="flex flex-col gap-8 p-0">
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
			class="w-full focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
		>
			{#if $navigating}
				<Loader class="animate-spin-slow" />
			{:else}
				Přihlásit se
			{/if}
		</Form.Button>
	</form>

	<div class="relative">
		<Separator></Separator>
		<span
			class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 px-2 text-sm bg-white text-muted-foreground"
			>Nebo pokračujte pomocí</span
		>
	</div>
	<!-- GOOGLE AND GITHUB ICONS -->
	<div class="flex gap-4">
		<!-- GOOGLE OAUTH -->
		<a
			class="flex justify-center items-center w-1/2 py-2 px-8 border border-input rounded text-muted-foreground hover:text-black"
			href="#"
		>
			<!-- ICON -->
			<svg
				class="h-6 w-6"
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				fill="currentColor"
				viewBox="0 0 16 16"
			>
				<path
					d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"
				/>
			</svg>
		</a>
		<!-- GITHUB OAUTH -->
		<a
			class="flex justify-center items-center w-1/2 py-2 px-8 border border-input rounded text-muted-foreground hover:text-black"
			href="#"
		>
			<!-- ICON -->
			<svg
				class="h-6 w-6"
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				fill="currentColor"
				viewBox="0 0 16 16"
			>
				<path
					d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z"
				/>
			</svg>
		</a>
	</div>
</Card.Content>
