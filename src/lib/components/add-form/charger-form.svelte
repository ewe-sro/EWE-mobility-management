<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	import { Plus } from 'lucide-svelte';

	import CompanyCombobox from './misc/company-combobox.svelte';
	import UserCombobox from './misc/user-combobox.svelte';
	import ApiKey from './misc/api-key.svelte';
	import SubmitLoader from './misc/submit-loader.svelte';

	export let formObj: any;
	export let companies: any;
	export let users: any;
	export let keyIcon: boolean;
	export let dialogOpen: boolean;
	export let selectedCompanyId: undefined | string = undefined;

	import SuperDebug, { superForm } from 'sveltekit-superforms';

	const form = superForm(formObj);
	const { form: formData, message, delayed, enhance } = form;

	// Used for tracking state of the combobox
	let companyComboboxOpen = false;
	let userComboboxOpen = false;

	// Open the dialog with POST form on ?customer param
	$: if (selectedCompanyId && !$formData.companyId) {
		$formData.companyId = Number(selectedCompanyId);
	}
</script>

<Dialog.Root bind:open={dialogOpen} onOpenChange={() => ($message = false)}>
	<Dialog.Trigger
		on:click={() => (dialogOpen = true)}
		class="flex items-center gap-1.5 h-auto px-2 py-1.5 bg-primary text-sm text-white font-medium rounded-md hover:bg-primary/90
    active:ring-2 active:ring-offset-0 active:ring-primary/30 active:border-primary/70"
	>
		<Plus size="16" />
		Přidat nabíjecí stanici
		{#if keyIcon}
			<span class="flex justify-center items-center h-4 w-4 bg-primary-600 leading-none rounded"
				>n</span
			>
		{/if}
	</Dialog.Trigger>
	<Dialog.Content class="gap-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
		<Dialog.Header>
			<Dialog.Title>Přidat nabíjecí stanici</Dialog.Title>
			<Separator />
		</Dialog.Header>

		{#if !$message}
			<form
				id="chargerForm"
				method="POST"
				action="?/chargerForm"
				class="flex flex-col gap-6"
				use:enhance
			>
				<!-- NAME -->
				<Form.Field {form} name="name">
					<Form.Control let:attrs>
						<Form.Label>Název nabíjecí stanice</Form.Label>
						<Input
							{...attrs}
							bind:value={$formData.name}
							type="text"
							autocomplete="off"
							class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
						/>
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<!-- DESCRIPTION -->
				<Form.Field {form} name="description">
					<Form.Control let:attrs>
						<Form.Label>Popis</Form.Label>
						<Input
							{...attrs}
							bind:value={$formData.description}
							type="text"
							autocomplete="off"
							class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
						/>
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<CompanyCombobox
					{form}
					bind:formData={$formData}
					{companies}
					bind:comboboxOpen={companyComboboxOpen}
				/>
				<!-- <UserCombobox {form} bind:formData={$formData} {users} bind:comboboxOpen={userComboboxOpen} /> -->
			</form>
		{:else}
			<ApiKey apiKey={$message}>
				Nabíjecí stanice byla úspěšně přidána do systému. Pro dokončení nastavení vložte tento klíč
				do konfiguračního souboru nabíjecí stanice.
			</ApiKey>
		{/if}

		<Dialog.Footer class="!flex-col">
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
				{#if !$message}
					<Button
						type="submit"
						form="chargerForm"
						class="flex items-center gap-1.5 h-auto px-2 py-1.5 bg-primary text-sm text-white font-medium rounded-md hover:bg-primary/90
            active:ring-2 active:ring-offset-0 active:ring-primary/30 active:border-primary/70
            focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					>
						<SubmitLoader delayed={$delayed} iconSize={16}>Pokračovat</SubmitLoader>
					</Button>
				{:else}
					<Button
						on:click={() => (dialogOpen = false)}
						class="flex items-center gap-1.5 h-auto px-2 py-1.5 bg-primary text-sm text-white font-medium rounded-md hover:bg-primary/90
		active:ring-2 active:ring-offset-0 active:ring-primary/30 active:border-primary/70
		focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
						>Pokračovat</Button
					>
				{/if}
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
