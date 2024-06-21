<script lang="ts">
	import { tick } from 'svelte';

	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	import { TriangleAlert, Plus } from 'lucide-svelte';

	import CompanyCombobox from './misc/company-combobox.svelte';
	import RoleSelect from './misc/role-select.svelte';

	export let data: any;
	export let dialogOpen: boolean;

	import { superForm } from 'sveltekit-superforms';
	import SuperDebug from 'sveltekit-superforms';

	const form = superForm(data.form);
	const { form: formData, message, enhance } = form;

	// Used for tracking state of the combobox
	let comboboxOpen = false;
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger
		on:click={() => (dialogOpen = true)}
		class="flex items-center gap-1.5 h-auto px-2 py-1.5 bg-primary text-sm text-white font-medium rounded-md shadow-sm hover:bg-primary/90
    active:ring-2 active:ring-offset-0 active:ring-primary/30 active:border-primary/70"
	>
		<Plus size="16" />
		Pozvat uživatele
		<span class="flex justify-center items-center h-4 w-4 bg-primary-600 leading-none rounded"
			>n</span
		>
	</Dialog.Trigger>
	<Dialog.Content class="gap-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
		<!-- <SuperDebug data={$formData} /> -->
		<Dialog.Header>
			<Dialog.Title>Pozvat uživatele</Dialog.Title>
			<Separator />
		</Dialog.Header>

		<form
			id="inviteUserForm"
			class="flex flex-col gap-6"
			method="POST"
			action="?/inviteUserForm"
			use:enhance
		>
			<!-- EMAIL -->
			<Form.Field {form} name="email">
				<Form.Control let:attrs>
					<Form.Label>E-mail</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData.email}
						type="email"
						autocomplete="email"
						class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- FIRST NAME -->
			<Form.Field {form} name="firstName">
				<Form.Control let:attrs>
					<Form.Label>Křestní jméno</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData.firstName}
						type="text"
						autocomplete="given-name"
						class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- LAST NAME -->
			<Form.Field {form} name="lastName">
				<Form.Control let:attrs>
					<Form.Label>Příjmení</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData.lastName}
						type="text"
						autocomplete="family-name"
						class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<CompanyCombobox
				{form}
				bind:formData={$formData}
				companies={data.companies}
				bind:comboboxOpen
			/>

			{#if $formData.companyId}
				<!-- <RoleSelect {form} bind:formData={$formData} /> -->
			{/if}

			{#if $message}
				<span class="inline-flex items-center gap-1 text-sm text-destructive font-medium">
					<TriangleAlert size="16" />
					{$message}
				</span>
			{/if}
		</form>

		<div>
			<Separator class="mb-2" />
			<div class="flex justify-end gap-1.5">
				<Button
					on:click={() => (dialogOpen = false)}
					variant="ghost"
					class="h-auto px-2 py-1.5 text-sm
                active:ring-2 active:ring-offset-0 active:ring-accent/30 active:border-accent/70
            focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-accent/30 focus-visible:border-accent/70"
					>Zrušit</Button
				>
				<Button
					type="submit"
					form="inviteUserForm"
					class="flex items-center gap-1.5 h-auto px-2 py-1.5 bg-primary text-sm text-white font-medium rounded-md hover:bg-primary/90
            active:ring-2 active:ring-offset-0 active:ring-primary/30 active:border-primary/70
            focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					>Pokračovat</Button
				>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
