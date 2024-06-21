<script lang="ts">
	import { tick } from 'svelte';

	import * as Dialog from '$lib/components/ui/dialog';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	import { TriangleAlert, Plus, ChevronsUpDown, Check } from 'lucide-svelte';

	import CompanyCombobox from './misc/company-combobox.svelte';
	import UserCombobox from './misc/user-combobox.svelte';

	export let formObj: any;
	export let companies: any;
	export let users: any;
	export let keyIcon: boolean;
	export let dialogOpen: boolean;

	import { superForm } from 'sveltekit-superforms';

	const form = superForm(formObj);
	const { form: formData, message, enhance } = form;

	// Used for tracking state of the combobox
	let companyComboboxOpen = false;
	let userComboboxOpen = false;
</script>

<Dialog.Root bind:open={dialogOpen}>
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

		<form id="addChargerForm" class="flex flex-col gap-6" method="POST" use:enhance>
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

			<!-- IP ADDRESS -->
			<Form.Field {form} name="ipAddress">
				<Form.Control let:attrs>
					<Form.Label>IP adresa</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData.ipAddress}
						type="text"
						autocomplete="off"
						class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- MQTT PORT -->
			<Form.Field {form} name="mqttPort">
				<Form.Control let:attrs>
					<Form.Label>MQTT port</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData.mqttPort}
						type="number"
						min="1"
						max="65535"
						autocomplete="off"
						class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="flex gap-2">
				<!-- MQTT USER -->
				<Form.Field {form} name="mqttUser" class="flex-1">
					<Form.Control let:attrs>
						<Form.Label>MQTT uživatel</Form.Label>
						<Input
							{...attrs}
							bind:value={$formData.mqttUser}
							type="text"
							autocomplete="off"
							class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
						/>
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="mqttPassword" class="flex-1">
					<Form.Control let:attrs>
						<Form.Label>MQTT heslo</Form.Label>
						<Input
							{...attrs}
							bind:value={$formData.mqttPassword}
							type="text"
							autocomplete="off"
							class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
						/>
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<!-- REST API PORT -->
			<Form.Field {form} name="restApiPort">
				<Form.Control let:attrs>
					<Form.Label>REST API port</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData.restApiPort}
						type="number"
						min="1"
						max="65535"
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
			<UserCombobox {form} bind:formData={$formData} {users} bind:comboboxOpen={userComboboxOpen} />

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
					form="addChargerForm"
					class="flex items-center gap-1.5 h-auto px-2 py-1.5 bg-primary text-sm text-white font-medium rounded-md hover:bg-primary/90
            active:ring-2 active:ring-offset-0 active:ring-primary/30 active:border-primary/70
            focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					>Pokračovat</Button
				>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
