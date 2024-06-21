<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';

	import * as Card from '$lib/components/ui/card';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';

	import CompanyChargingData from '$lib/components/charts/company-charging-data/company-charging-data.svelte';

	import { Ellipsis } from 'lucide-svelte';

	import { updateFlash } from 'sveltekit-flash-message';

	import CompanySubcard from './company-subcard/company-subcard.svelte';

	import { Image } from '@unpic/svelte';

	import { emptyStringOnNull } from '$lib/utils';

	export let company;
	export let user;
	export let graphData;

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

<Card.Root class="flex flex-col gap-8 w-full p-8">
	<Card.Header class="flex flex-row justify-between gap-4 p-0">
		<div class="flex flex-col items-start gap-2">
			{#if company.companyTable.logo}
				<Image
					src={company.companyTable.logo}
					alt="{company.companyTable.name} logo"
					layout="constrained"
					class="h-full max-h-12 w-auto"
					height={48}
					width={100}
				/>
			{/if}
			<Card.Title class="text-2xl font-semibold">{company.companyTable.name}</Card.Title>
			<Card.Description>
				{emptyStringOnNull(company.companyTable.city)}<br />
				{emptyStringOnNull(company.companyTable.street)}
			</Card.Description>
		</div>
		<DropdownMenu.Root>
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
						href="/companies/{company.companyTable.id}"
						class="text-muted-foreground font-medium">Detail společnosti</DropdownMenu.Item
					>
					{#if user.role === 'ADMIN'}
						<DropdownMenu.Item
							href="/companies/{company.companyTable.id}?action=edit"
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
	</Card.Header>
	<Card.Content class="flex flex-col gap-12 p-0">
		<div class="grid grid-cols-4 gap-4">
			<CompanySubcard>
				<span slot="valueName">Nabíjecí stanice</span>
				<span slot="value">{company.chargerCount ?? 0}</span>
			</CompanySubcard>
			<CompanySubcard>
				<span slot="valueName">Nabíjecí body</span>
				<span slot="value">{company.controllerCount ?? 0}</span>
			</CompanySubcard>
			<CompanySubcard>
				<span slot="valueName">K dispozici</span>
				<span slot="value">{company.controllerCount ?? 0}</span>
			</CompanySubcard>
			<CompanySubcard>
				<span slot="valueName">Zaměstnanci</span>
				<span slot="value">{company.employeeCount ?? 0}</span>
			</CompanySubcard>
		</div>
		<CompanyChargingData data={graphData} />
	</Card.Content>
</Card.Root>

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
				on:click={() => deleteCompany(company.companyTable.id)}
				class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
				>Smazat</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
