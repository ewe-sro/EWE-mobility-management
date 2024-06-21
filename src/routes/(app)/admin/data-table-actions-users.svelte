<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';

	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';

	import { Ellipsis } from 'lucide-svelte';

	import { updateFlash } from 'sveltekit-flash-message';

	export let id: string;
	export let loggedUser: string;

	// Controls the delete dialog
	let deleteDialogOpen = false;

	const dispatch = createEventDispatcher();

	const deleteUser = async (id: string) => {
		await fetch(`/api/user/${id}/delete`, {
			method: 'DELETE'
		});

		// Emit an event to notify parent component to update its data
		dispatch('userDeleted', id);

		await updateFlash(page);
	};
</script>

<DropdownMenu.Root>
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
			{#if loggedUser === id}
				<DropdownMenu.Item href="/profile" class="text-muted-foreground font-medium"
					>Zobrazit profil</DropdownMenu.Item
				>
			{:else}
				<DropdownMenu.Item href="#" class="text-muted-foreground font-medium"
					>Detail uživatele</DropdownMenu.Item
				>
				<DropdownMenu.Item class="text-muted-foreground font-medium"
					>Upravit údaje</DropdownMenu.Item
				>
				<DropdownMenu.Item
					on:click={() => (deleteDialogOpen = true)}
					class="text-destructive font-medium hover:bg-red-100 hover:text-destructive"
					>Smazat uživatele</DropdownMenu.Item
				>
			{/if}
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<!-- DELETE DIALOG -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Jste jisti, že chcete smazat tohoto uživatele?</AlertDialog.Title>
			<AlertDialog.Description>
				Tuto akci nelze vzít zpět. Dojde k trvalému smazání všech uživatelských dat.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Zrušit</AlertDialog.Cancel>
			<AlertDialog.Action
				on:click={() => deleteUser(id)}
				class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
				>Smazat</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
