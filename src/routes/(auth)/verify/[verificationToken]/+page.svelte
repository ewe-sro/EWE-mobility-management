<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';

	import { TriangleAlert } from 'lucide-svelte';

	import { superForm } from 'sveltekit-superforms';
	import SuperDebug from 'sveltekit-superforms';

	export let data;

	const form = superForm(data.form);
	const { form: formData, message, enhance } = form;
</script>

<Card.Header class="p-0 pb-8">
	<Card.Title tag="h1" class="text-2xl font-bold">Registrace</Card.Title>
	<Card.Description>Dokončete registraci vyplněním tohoto formuláře.</Card.Description>
</Card.Header>

<Card.Content class="p-0">
	<SuperDebug data={$formData} />
	<form id="registerForm" method="POST" use:enhance class="flex flex-col gap-8">
		<div class="grid grid-cols-2 gap-4">
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

			<Form.Field {form} name="firstName">
				<Form.Control let:attrs>
					<Form.Label>Křestní jméno</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData.firstName}
						type="text"
						tabindex={1}
						class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
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
						tabindex={1}
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
						tabindex={1}
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
						tabindex={1}
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

		<Form.Button
			class="w-full text-white focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
			>Registrovat se
		</Form.Button>
	</form>
</Card.Content>
