<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';

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
					on:click={() => deleteEmployee(id)}
					class="text-destructive font-medium hover:bg-red-100 hover:text-destructive"
				>
					Odstranit zaměstnance
				</DropdownMenu.Item>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>

	<RfidForm {id} formObj={rfidForm} {employee} bind:dialogOpen={rfidDialogOpen} />
	<RoleForm {id} formObj={employeeForm} {employee} bind:dialogOpen={employeeDialogOpen} />
</ShowToAdminsAndManagers>
