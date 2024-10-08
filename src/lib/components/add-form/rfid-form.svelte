<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	import FormMessage from '$lib/components/form-message/form-message.svelte';

	import { TriangleAlert, Plus } from 'lucide-svelte';

	import { superForm } from 'sveltekit-superforms';

	export let formObj: any;
	export let dialogOpen: boolean;

	const form = superForm(formObj);
	const { form: formData, message, enhance } = form;
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger
		on:click={() => (dialogOpen = true)}
		class="flex items-center gap-1.5 h-auto px-2 py-1.5 bg-primary text-sm text-white font-medium rounded-md hover:bg-primary/90
active:ring-2 active:ring-offset-0 active:ring-primary/30 active:border-primary/70"
	>
		<Plus size="16" />
		Přidat RFID
	</Dialog.Trigger>
	<Dialog.Content class="gap-8">
		<Dialog.Header>
			<Dialog.Title>Přidat RFID</Dialog.Title>
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
				<Form.Description>
					Zadejte identifikační popis, pomocí kterého poznáte, o jaké RFID se jedná.
				</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<FormMessage message={$message} />
		</form>

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
				<Button
					type="submit"
					form="otherRfidForm"
					class="flex items-center gap-1.5 h-auto px-2 py-1.5 bg-primary text-sm text-white font-medium rounded-md hover:bg-primary/90
            active:ring-2 active:ring-offset-0 active:ring-primary/30 active:border-primary/70
            focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					>Přidat RFID</Button
				>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
