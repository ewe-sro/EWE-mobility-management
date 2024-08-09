<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';

	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';

	import ChargerStatus from '$lib/components/charging-status/charger-status.svelte';
	import Subcard from '../subcard/subcard.svelte';

	import { Ellipsis } from 'lucide-svelte';

	import { updateFlash } from 'sveltekit-flash-message';

	import { getDateDifference } from '$lib/utils';

	export let data;
	export let user;

	// Controls the delete dialog
	let deleteDialogOpen = false;

	// Get the status of the charger
	let status;

	if (!data.charger.lastConnected) {
		status = 'unavailable';
	} else if (getDateDifference(data.charger.lastConnected) > 3 * 60) {
		status = 'offline';
	} else {
		status = 'online';
	}

	const dispatch = createEventDispatcher();

	const deleteCharger = async (id: number) => {
		await fetch(`/api/charger/${id}/delete`, {
			method: 'DELETE'
		});

		// Emit an event to notify parent component to update its data
		dispatch('chargerDeleted', id);

		await updateFlash(page);
	};
</script>

<Card.Root class="flex flex-col gap-8 w-full p-8">
	<Card.Header class="flex flex-row justify-between items-start gap-4 p-0 space-y-0">
		<div class="flex flex-col items-start gap-1">
			<Card.Title class="text-xl font-semibold">{data.charger.name}</Card.Title>
			<Card.Description>{data.charger.description}</Card.Description>
		</div>

		<div class="flex items-center gap-2">
			<ChargerStatus {status} class="bg-muted" />
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
						<DropdownMenu.Item
							href="/chargers/{data.charger.id}"
							class="text-muted-foreground font-medium">Detail nabíjecí stanice</DropdownMenu.Item
						>
						{#if user.role === 'ADMIN'}
							<DropdownMenu.Item
								href="/chargers/{data.charger.id}?action=edit"
								class="text-muted-foreground font-medium">Upravit údaje</DropdownMenu.Item
							>
							<DropdownMenu.Item
								class="text-destructive font-medium hover:bg-red-100 hover:text-destructive"
								on:click={() => (deleteDialogOpen = true)}
								>Smazat nabíjecí stanici</DropdownMenu.Item
							>
						{/if}
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</Card.Header>
	<Card.Content class="p-0 grid grid-cols-2 gap-2">
		<Subcard class="flex justify-between items-center">
			<span class="text-sm text-muted-foreground font-medium">Počet nabíjecích bodů</span>
			<span class="text-lg font-bold">{data.controllerCount}</span>
		</Subcard>
		<Subcard class="flex justify-between items-center">
			<span class="text-sm text-muted-foreground font-medium">K dispozici</span>
			<span class="text-lg font-bold">{data.availableCount ?? 0}</span>
		</Subcard>
	</Card.Content>
</Card.Root>

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
				on:click={() => deleteCharger(data.charger.id)}
				class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
				>Smazat</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
