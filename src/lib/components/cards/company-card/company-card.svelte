<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	import * as Card from '$lib/components/ui/card';

	import CompanyChargingData from '$lib/components/charts/company-charging-data/company-charging-data.svelte';
	import CompanyDropdown from '$lib/components/dropdowns/company-dropdown.svelte';
	import CompanySubcard from './company-subcard/company-subcard.svelte';

	import { Image } from '@unpic/svelte';

	import { emptyStringOnNull } from '$lib/utils';

	export let company;
	export let employeeCount;
	export let user;
	export let chargingData;

	const handleRowDelete = async (event: any) => {
		const deletedId = event.detail;

		invalidateAll();
	};
</script>

<Card.Root class="flex flex-col gap-8 w-full p-8">
	<Card.Header class="flex flex-row justify-between gap-4 p-0 space-y-0">
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
		<CompanyDropdown
			companyId={company.companyTable.id}
			userRole={user.role}
			on:companyDeleted={handleRowDelete}
		/>
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
				<span slot="value">{company.availableCount ?? 0}</span>
			</CompanySubcard>
			<CompanySubcard>
				<span slot="valueName">Zaměstnanci</span>
				<span slot="value">{employeeCount[0]?.count ?? 0}</span>
			</CompanySubcard>
		</div>
		<CompanyChargingData
			data={chargingData.graph}
			lastMonth={chargingData.lastMonth}
			thisMonth={chargingData.thisMonth}
		/>
	</Card.Content>
</Card.Root>
