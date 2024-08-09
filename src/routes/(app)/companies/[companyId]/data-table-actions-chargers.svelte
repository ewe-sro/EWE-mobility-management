<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';

	import { updateFlash } from 'sveltekit-flash-message';

	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';

	import ShowToAdminsAndManagers from '$lib/components/role-container/show-to-admins-and-managers.svelte';

	import { Ellipsis } from 'lucide-svelte';

	export let id: string;
	export let user;
	export let userInCompany;

	let deleteDialogOpen = false;

	const dispatch = createEventDispatcher();

	const deleteCharger = async (id: string) => {
		await fetch(`/api/charger/${id}/delete`, {
			method: 'DELETE'
		});

		// Emit an event to notify parent component to update its data
		dispatch('chargerDeleted', id);

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
			<DropdownMenu.Item class="text-muted-foreground font-medium" href="/chargers/{id}"
				>Detail nabíjecí stanice</DropdownMenu.Item
			>
			<ShowToAdminsAndManagers {user} {userInCompany}>
				<DropdownMenu.Item
					class="text-muted-foreground font-medium"
					href="/chargers/{id}?action=edit">Upravit údaje</DropdownMenu.Item
				>
				<DropdownMenu.Item
					on:click={() => (deleteDialogOpen = true)}
					class="text-destructive font-medium hover:bg-red-100 hover:text-destructive"
				>
					Odstranit nabíjecí stanici
				</DropdownMenu.Item>
			</ShowToAdminsAndManagers>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<!-- DELETE DIALOG -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Jste jisti, že chcete smazat tuto nabíjecí stanici?</AlertDialog.Title>
			<AlertDialog.Description>
				Tuto akci nelze vzít zpět. Dojde k trvalému smazání všech dat spojených s nabíjecí stanicí
				včetně všech nabíjecích bodů a nabíjecích dat.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Zrušit</AlertDialog.Cancel>
			<AlertDialog.Action
				on:click={() => deleteCharger(id)}
				class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
				>Smazat</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
