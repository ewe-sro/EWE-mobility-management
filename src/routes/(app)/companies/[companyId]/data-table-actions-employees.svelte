<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';

	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	import { Ellipsis } from 'lucide-svelte';

	import { superForm, dateProxy } from 'sveltekit-superforms';
	import SuperDebug from 'sveltekit-superforms';

	import { updateFlash } from 'sveltekit-flash-message';

	export let id: string;
	export let formObj: any;
	export let employee: any;

	// Controls the state of the dialog
	let dialogOpen = false;

	const form = superForm(formObj, {
		id: id,
		onUpdated() {
			$formData.rfidTag = employee[0].rfidTag;
			$formData.rfidValidTill = employee[0].rfidValidTill;
			$formData.userId = id;
		}
	});
	const { form: formData, message, enhance } = form;

	const rfidValidTillProxy = dateProxy(form, 'rfidValidTill', {
		format: 'datetime-local',
		empty: 'null'
	});

	// Set the initial formData
	$formData.rfidTag = employee[0].rfidTag;
	$formData.rfidValidTill = employee[0].rfidValidTill;
	$formData.userId = id;

	const dispatch = createEventDispatcher();

	const deleteEmployee = async (id: string) => {
		await fetch(`/api/employee/${id}/delete`, {
			method: 'DELETE'
		});

		// Emit an event to notify parent component to update its data
		dispatch('employeeDeleted', id);

		await updateFlash(page);
	};
</script>

<DropdownMenu.Root preventScroll={false}>
	<DropdownMenu.Trigger asChild let:builder>
		<Button
			variant="ghost"
			builders={[builder]}
			size="icon"
			class="actions group relative h-6 w-6 p-0 hover:bg-slate-200"
		>
			<span class="sr-only">Otevřít menu</span>
			<Ellipsis size="16" class="text-muted-foreground group-hover:text-black" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Group>
			<DropdownMenu.Item
				on:click={() => (dialogOpen = true)}
				class="text-muted-foreground font-medium">Nastavit RFID</DropdownMenu.Item
			>
			<DropdownMenu.Item
				on:click={() => deleteEmployee(id)}
				class="text-destructive font-medium hover:bg-red-100 hover:text-destructive"
			>
				Odstranit zaměstnance
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<!-- RFID dialog -->
<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="gap-8">
		<Dialog.Header>
			<Dialog.Title>Nastavit RFID</Dialog.Title>
			<Separator />
		</Dialog.Header>

		<SuperDebug data={$formData} />

		<form id="rfidForm" class="flex flex-col gap-6" method="POST" action="?/rfidForm" use:enhance>
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

			<!-- NAMRE -->
			<Form.Field {form} name="rfidValidTill">
				<Form.Control let:attrs>
					<Form.Label>RFID platné do</Form.Label>
					<Input
						{...attrs}
						bind:value={$rfidValidTillProxy}
						type="datetime-local"
						class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<input type="hidden" name="userId" bind:value={$formData.userId} />
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
					form="rfidForm"
					class="flex items-center gap-1.5 h-auto px-2 py-1.5 bg-primary text-sm text-white font-medium rounded-md hover:bg-primary/90
            active:ring-2 active:ring-offset-0 active:ring-primary/30 active:border-primary/70
            focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					>Pokračovat</Button
				>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
