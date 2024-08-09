<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';

	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';

	import { Ellipsis } from 'lucide-svelte';

	import { updateFlash } from 'sveltekit-flash-message';

	export let companyId;
	export let userRole;

	// Controls the delete dialog
	let deleteDialogOpen = false;

	const dispatch = createEventDispatcher();

	const deleteCompany = async (id: number) => {
		await fetch(`/api/company/${id}/delete`, {
			method: 'DELETE'
		});

		// Emit an event to notify parent component to update its data
		dispatch('companyDeleted', id);

		await updateFlash(page);
	};
</script>

<DropdownMenu.Root preventScroll={false}>
	<DropdownMenu.Trigger asChild let:builder>
		<Button
			variant="ghost"
			builders={[builder]}
			size="icon"
			class="actions group relative h-8 w-8 p-0"
		>
			<span class="sr-only">Otevřít menu</span>
			<Ellipsis size="16" class="text-muted-foreground group-hover:text-black" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Group>
			<DropdownMenu.Item href="/companies/{companyId}" class="text-muted-foreground font-medium"
				>Detail společnosti</DropdownMenu.Item
			>
			{#if userRole === 'ADMIN'}
				<DropdownMenu.Item
					href="/companies/{companyId}?action=edit"
					class="text-muted-foreground font-medium">Upravit údaje</DropdownMenu.Item
				>
				<DropdownMenu.Item
					class="text-destructive font-medium hover:bg-red-100 hover:text-destructive"
					on:click={() => (deleteDialogOpen = true)}>Smazat společnost</DropdownMenu.Item
				>
			{/if}
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<!-- DELETE DIALOG -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Jste jisti, že chcete smazat tuto společnost?</AlertDialog.Title>
			<AlertDialog.Description>
				Tuto akci nelze vzít zpět. Dojde k trvalému smazání všech dat spojených se společností
				včetně všech nabíjecích stanic, přiřazených zaměstnanců atd.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Zrušit</AlertDialog.Cancel>
			<AlertDialog.Action
				on:click={() => deleteCompany(companyId)}
				class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
				>Smazat</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
