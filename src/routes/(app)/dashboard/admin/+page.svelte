<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as HoverCard from '$lib/components/ui/hover-card';

	import { MapLibre } from 'svelte-maplibre';

	import CompanyCard from '$lib/components/dashboard/company-card/dashboard-company-card.svelte';
	import ControllerCard from '$lib/components/cards/controller-card/controller-card.svelte';
	import DashboardMap from '$lib/components/dashboard/map/dashboard-map.svelte';

	import TodayChargingData from '$lib/components/charts/dashboard/today-charging-data/today-charging-data.svelte';
	import DownloadButton from '$lib/components/charts/dashboard/today-charging-data/download-button.svelte';

	import { convertEnergyPower, getChargerStatus, getCsvFromData } from '$lib/utils';

	export let data;

	let csvData = getCsvFromData(data.chargingSessions);
</script>

<section class="py-12 ~px-4/8">
	<div class="max-w-5xl m-auto flex flex-col gap-8 h-full">
		<h1 class="text-3xl font-bold">Nástěnka</h1>

		<div class="flex flex-col gap-20">
			<div class="flex gap-4">
				<Card.Root class="relative flex flex-col justify-center items-center gap-6 p-6">
					<div class="relative">
						<TodayChargingData data={data.sessionChartData} />

						<div
							class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
						>
							<span class="text-sm text-muted-foreground font-medium leading-none"
								>nabito za 30 dní</span
							>
							<span class="text-xl font-bold leading-none"
								>{convertEnergyPower(data.totalConsumption, 'Wh')}</span
							>
						</div>
					</div>

					<HoverCard.Root openDelay={0} closeDelay={0}>
						<HoverCard.Trigger class="absolute top-4 right-4">
							<DownloadButton data={csvData} />
						</HoverCard.Trigger>
						<HoverCard.Content>Stáhnout data</HoverCard.Content>
					</HoverCard.Root>
				</Card.Root>

				<DashboardMap />
			</div>

			{#each data.companies as company}
				{@const usedControllers = data.usedControllers.filter(
					(row) => row.charger?.companyId === company.company.id
				)}
				<div class="flex flex-col gap-4">
					<CompanyCard {company} />
					<div class="grid grid-cols-3 gap-4 items-start">
						{#each usedControllers as controller}
							{@const status = getChargerStatus(controller.charger?.lastConnected)}
							<ControllerCard data={controller} {status} />
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
