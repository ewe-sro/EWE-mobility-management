<script lang="ts">
	import * as Card from '$lib/components/ui/card';

	import TodayChargingData from '$lib/components/charts/dashboard/today-charging-data/today-charging-data.svelte';
	import DownloadButton from '$lib/components/charts/dashboard/today-charging-data/download-button.svelte';
	import DashboardCompanyCard from '$lib/components/dashboard/company-card/dashboard-company-card.svelte';
	import DashboardControllerCard from '$lib/components/dashboard/controller-card/dashboard-controller-card.svelte';
	import DashboardControllerSkeleton from '$lib/components/dashboard/controller-card/skeleton/dashboard-controller-skeleton.svelte';

	import { convertEnergyPower } from '$lib/utils';

	export let data;
</script>

<section class="h-full ~p-4/8">
	<div class="container m-auto flex flex-col gap-8 h-full">
		<h1 class="text-3xl font-bold">Nástěnka</h1>

		<div class="grid grid-cols-12 gap-4">
			<div class="col-span-8 grid grid-rows-2 gap-4">
				{#each data.companies as company}
					<DashboardCompanyCard {company} />
				{/each}
			</div>

			<Card.Root class="col-span-4 flex flex-col justify-center items-center p-8">
				<div class="relative">
					<TodayChargingData data={data.sessionChartData} />
					<div
						class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
					>
						<span class="text-sm text-muted-foreground leading-none">nabito za 30 dní</span>
						<span class="text-xl font-bold leading-none"
							>{convertEnergyPower(data.totalConsumption, 'Wh')}</span
						>
					</div>
				</div>

				<DownloadButton data={data.sessionChartData} />
			</Card.Root>
		</div>
	</div>
</section>
