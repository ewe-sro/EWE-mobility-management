<script lang="ts">
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';

	import { updateFlash } from 'sveltekit-flash-message';

	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	import ShowToAdminsAndManagers from '$lib/components/role-container/show-to-admins-and-managers.svelte';

	import { Ellipsis, TriangleAlert } from 'lucide-svelte';

	import { superForm, dateProxy } from 'sveltekit-superforms';
	import SuperDebug from 'sveltekit-superforms';

	export let id: string;
	export let formObj: any;
	export let rfid: any;
	export let user;
	export let userInCompany;

	let dialogOpen = false;
	let deleteDialogOpen = false;

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

	const deleteRfid = async (id: string) => {
		await fetch(`/api/company/${$page.params.companyId}/rfid/${id}/delete`, {
			method: 'DELETE'
		});

		invalidateAll();

		await updateFlash(page);
	};
</script>

<ShowToAdminsAndManagers {user} {userInCompany}>
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
					class="text-muted-foreground font-medium">Upravit údaje</DropdownMenu.Item
				>
				<DropdownMenu.Item
					on:click={() => (deleteDialogOpen = true)}
					class="text-destructive font-medium hover:bg-red-100 hover:text-destructive"
				>
					Odstranit RFID
				</DropdownMenu.Item>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>

	<!-- DELETE DIALOG -->
	<AlertDialog.Root bind:open={deleteDialogOpen}>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Jste jisti, že chcete smazat toto RFID?</AlertDialog.Title>
				<AlertDialog.Description>Tuto akci nelze vzít zpět.</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Zrušit</AlertDialog.Cancel>
				<AlertDialog.Action
					on:click={() => deleteRfid(id)}
					class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>Smazat</AlertDialog.Action
				>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>

	<!-- RFID dialog -->
	<Dialog.Root bind:open={dialogOpen}>
		<Dialog.Content class="gap-8">
			<Dialog.Header>
				<Dialog.Title>Nastavit RFID</Dialog.Title>
				<Separator />
			</Dialog.Header>

			<SuperDebug data={$formData} />

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
</ShowToAdminsAndManagers>
