<script lang="ts">
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';

	import { updateFlash } from 'sveltekit-flash-message';

	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';

	import SeparateRfidForm from '$lib/components/edit-form/separate-rfid-form.svelte';
	import ShowToAdminsAndManagers from '$lib/components/role-container/show-to-admins-and-managers.svelte';

	import { Ellipsis } from 'lucide-svelte';

	export let id: string;
	export let formObj: any;
	export let rfid: any;
	export let user;
	export let userInCompany;

	let dialogOpen = false;
	let deleteDialogOpen = false;

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
					class="text-red-500 hover:text-red-500 dark:hover:text-white font-medium hover:bg-red-100 dark:hover:bg-red-500"
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
				<AlertDialog.Title>Jste si jisti, že chcete smazat toto RFID?</AlertDialog.Title>
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

	<SeparateRfidForm {id} {formObj} {rfid} bind:dialogOpen />
</ShowToAdminsAndManagers>
