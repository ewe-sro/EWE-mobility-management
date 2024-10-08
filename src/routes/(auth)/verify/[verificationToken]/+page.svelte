<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';

	import { TriangleAlert, Loader2 } from 'lucide-svelte';

	import { superForm } from 'sveltekit-superforms';
	import SuperDebug from 'sveltekit-superforms';

	export let data;

	const form = superForm(data.form);
	const { form: formData, message, enhance, delayed } = form;

	// Check if name was prefilled and set it to $formData
	if (data.invitedUser.invitation.firstName)
		$formData.firstName = data.invitedUser.invitation.firstName;

	if (data.invitedUser.invitation.lastName)
		$formData.lastName = data.invitedUser.invitation.lastName;
</script>

<svelte:head>
	<title>Registrace – EMM</title>
</svelte:head>

<Card.Header class="p-0 pb-8">
	<Card.Title tag="h1" class="text-2xl font-bold">Registrace</Card.Title>
	<Card.Description>Dokončete registraci vyplněním tohoto formuláře.</Card.Description>
</Card.Header>

<Card.Content class="p-0">
	<form id="registerForm" method="POST" use:enhance class="flex flex-col gap-8">
		<div class="flex gap-4">
			<div class="flex-1 flex flex-col gap-2">
				<Form.Field {form} name="email">
					<Form.Control let:attrs>
						<Form.Label>E-mail</Form.Label>
						<Input
							readonly
							{...attrs}
							value={data.invitedUser.invitation.email}
							autocomplete="email"
							type="email"
							class="text-muted-foreground focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
						/>
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="password">
					<Form.Control let:attrs>
						<Form.Label>Heslo</Form.Label>
						<Input
							{...attrs}
							bind:value={$formData.password}
							autocomplete="new-password"
							type="password"
							class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
						/>
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="confirmPassword">
					<Form.Control let:attrs>
						<Form.Label>Potrvďte heslo</Form.Label>
						<Input
							{...attrs}
							bind:value={$formData.confirmPassword}
							autocomplete="confirm-password"
							type="password"
							class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
						/>
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<div class="flex-1 flex flex-col gap-2">
				<Form.Field {form} name="firstName">
					<Form.Control let:attrs>
						<Form.Label>Křestní jméno</Form.Label>
						<Input
							{...attrs}
							bind:value={$formData.firstName}
							type="text"
							class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
						/>
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="lastName">
					<Form.Control let:attrs>
						<Form.Label>Příjmení</Form.Label>
						<Input
							{...attrs}
							bind:value={$formData.lastName}
							type="text"
							class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
						/>
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="companyId">
					<Form.Control let:attrs>
						<Form.Label>Společnost</Form.Label>
						<Input
							{...attrs}
							value={data.invitedUser.invitation.companyId}
							readonly
							type="text"
							class="hidden"
						/>
						<Input
							value={data.invitedUser.company?.name}
							readonly
							type="text"
							class="text-muted-foreground focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
						/>
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>
		</div>

		{#if $message}
			<div class="flex items-center gap-2 text-sm text-destructive font-medium">
				<TriangleAlert size="16" />
				<span>{$message}</span>
			</div>
		{/if}

		<Form.Button
			disabled={$delayed}
			class="w-full text-white focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
		>
			{#if $delayed}
				<Loader2 class="animate-spin-slow" />
			{:else}
				Registrovat se
			{/if}
		</Form.Button>
	</form>
</Card.Content>
