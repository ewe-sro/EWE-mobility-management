<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dragHandleZone, type DndEvent } from 'svelte-dnd-action';

	import ShowOnlyFavorite from '$lib/components/dashboard/misc/show-only-favorite.svelte';
	import CompanyCollapsible from '$lib/components/dashboard/company-collapsible/company-collapsible.svelte';
	import ChargerCollapsible from '$lib/components/dashboard/charger-collapsible/charger-collapsible.svelte';
	import ControllerCard from '$lib/components/dashboard/controller-card/controller-card.svelte';

	import { dashboardOrder } from '$lib/stores';

	export let data;

	// Typeof data.companies and single item of data.companies
	type Companies = typeof data.companies;
	type Company = Companies[number];

	// Drag and drop items
	let items: Companies;

	$: if ($dashboardOrder.length > 0) {
		// sort the data based on localStorage => dashboardOrder if it is set
		items = data.companies.sort(
			(a, b) => $dashboardOrder.indexOf(a.id) - $dashboardOrder.indexOf(b.id)
		);
	} else {
		items = data.companies;
	}

	const handleConsider = (event: CustomEvent<DndEvent<Company>>) => {
		items = event.detail.items;
	};

	const handleFinalize = (event: CustomEvent<DndEvent<Company>>) => {
		items = event.detail.items;

		// Extract the ids from 'items' and save to an array
		const extractedIds = items.map((obj) => obj.id);

		// write the new order of the items to a persistent store
		$dashboardOrder = extractedIds;
	};
</script>

<svelte:head>
	<title>Dashboard – EMM</title>
</svelte:head>

<section class="h-full py-16 ~px-4/8">
	<div class="max-w-5xl m-auto flex flex-col gap-8 h-full">
		<h1 class="text-3xl font-bold">Nástěnka</h1>

		<div class="flex-1 flex flex-col gap-4">
			<ShowOnlyFavorite bind:data={items} class="self-end" />

			<div
				use:dragHandleZone={{
					items: items,
					flipDurationMs: 300,
					dropTargetClasses: ['active']
				}}
				on:consider={handleConsider}
				on:finalize={handleFinalize}
				class="flex-1 flex flex-col gap-8 p-2 dropzone"
			>
				{#each items as company (company.id)}
					{@const chargers = data.chargers.filter(
						(row) => row.charger.companyId === company.company.id
					)}
					{@const chargerIds = chargers.map((item) => item.charger.id)}

					<div
						class="rounded-lg border bg-card text-card-foreground shadow-sm w-full p-0"
						animate:flip={{ duration: 300 }}
					>
						<CompanyCollapsible {company} {chargerIds}>
							{#each chargers as charger}
								{@const controllers = data.controllers.filter(
									(row) => row.controller.chargerId === charger.charger.id
								)}

								<ChargerCollapsible {charger} controllerLength={controllers.length}>
									{#each controllers as controller}
										<ControllerCard data={controller} />
									{/each}
								</ChargerCollapsible>
							{/each}
						</CompanyCollapsible>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<style lang="postcss">
	.dropzone {
		&.active {
			@apply bg-primary/5 rounded-lg outline outline-2 !outline-primary/50 outline-offset-4;
		}
	}
</style>
