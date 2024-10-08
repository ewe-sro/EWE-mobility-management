<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';

	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';

	import RfidForm from '$lib/components/edit-form/rfid-form.svelte';
	import RoleForm from '$lib/components/edit-form/role-form.svelte';
	import ShowToAdminsAndManagers from '$lib/components/role-container/show-to-admins-and-managers.svelte';

	import { Ellipsis } from 'lucide-svelte';

	import { updateFlash } from 'sveltekit-flash-message';

	export let id: string;
	export let rfidForm: any;
	export let employeeForm: any;
	export let employee: any;

	export let user;
	export let userInCompany;

	let deleteDialogOpen = false;

	// Controls the RFID dialog
	let rfidDialogOpen = false;
	let employeeDialogOpen = false;

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
					on:click={() => (employeeDialogOpen = true)}
					class="text-muted-foreground font-medium">Změnit roli</DropdownMenu.Item
				>
				<DropdownMenu.Item
					on:click={() => (rfidDialogOpen = true)}
					class="text-muted-foreground font-medium">Nastavit RFID</DropdownMenu.Item
				>
				<DropdownMenu.Item
					on:click={() => (deleteDialogOpen = true)}
					disabled={id === userInCompany?.userId ? true : false}
					class="text-red-500 hover:text-red-500 dark:hover:text-white font-medium hover:bg-red-100 dark:hover:bg-red-500"
				>
					Odstranit zaměstnance
				</DropdownMenu.Item>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>

	<RfidForm {id} formObj={rfidForm} {employee} bind:dialogOpen={rfidDialogOpen} />
	<RoleForm {id} formObj={employeeForm} {employee} bind:dialogOpen={employeeDialogOpen} />

	<!-- DELETE DIALOG -->
	<AlertDialog.Root bind:open={deleteDialogOpen}>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Jste si jisti, že chcete odebrat tohoto zaměstnance?</AlertDialog.Title>
				<AlertDialog.Description>
					Tuto akci nelze vzít zpět. Dojde k odebrání zaměstnance ze společnosti a uživatel si již
					nebude moct zobrazit žádná data této společnosti.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Zrušit</AlertDialog.Cancel>
				<AlertDialog.Action
					on:click={() => deleteEmployee(id)}
					class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>Smazat</AlertDialog.Action
				>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
</ShowToAdminsAndManagers>
