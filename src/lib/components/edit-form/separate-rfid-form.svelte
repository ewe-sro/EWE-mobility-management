<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	import FormMessage from '../form-message/form-message.svelte';

	import { superForm, dateProxy } from 'sveltekit-superforms';

	export let id;
	export let formObj;
	export let rfid;
	export let dialogOpen: boolean;

	const form = superForm(formObj, {
		id: id,
		onUpdated() {
			$formData.rfidTag = rfid[0].tag;
			$formData.rfidValidTill = rfid[0].validTill;
			$formData.description = rfid[0].description;
			$formData.userId = rfid[0].companyId;
		}
	});
	const { form: formData, message, enhance } = form;

	const rfidValidTillProxy = dateProxy(form, 'rfidValidTill', {
		format: 'datetime-local',
		empty: 'null'
	});

	// Set the initial formData
	$formData.rfidTag = rfid[0].tag;
	$formData.rfidValidTill = rfid[0].validTill;
	$formData.description = rfid[0].description;
	$formData.id = rfid[0].id;
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="gap-8">
		<Dialog.Header>
			<Dialog.Title>Nastavit RFID</Dialog.Title>
			<Separator />
		</Dialog.Header>

		<form
			id="otherRfidForm"
			class="flex flex-col gap-6"
			method="POST"
			action="?/otherRfidForm"
			use:enhance
		>
			<!-- RFID TAG -->
			<Form.Field {form} name="rfidTag">
				<Form.Control let:attrs>
					<Form.Label>RFID</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData.rfidTag}
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

			<input type="hidden" name="id" bind:value={$formData.id} />

			<FormMessage message={$message} />
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
					form="otherRfidForm"
					class="flex items-center gap-1.5 h-auto px-2 py-1.5 bg-primary text-sm text-white font-medium rounded-md hover:bg-primary/90
        active:ring-2 active:ring-offset-0 active:ring-primary/30 active:border-primary/70
        focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					>Pokračovat</Button
				>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
