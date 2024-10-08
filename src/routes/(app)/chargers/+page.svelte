<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	import ChargerForm from '$lib/components/add-form/charger-form.svelte';
	import ChargerCard from '$lib/components/cards/charger-card/charger-card.svelte';
	import Keybinding from '$lib/components/keybinding/keybinding.svelte';
	import TableSkeleton from '$lib/components/table-skeleton/table-skeleton.svelte';

	export let data;

	// Used for tracking state of dialog
	let dialogOpen = false;

	let companyChargers: any;
	let userChargers: any;
	let otherChargers: any;

	$: if (data.chargers) {
		companyChargers = data.chargers.filter((row) => row.charger.companyId);
		userChargers = data.chargers.filter((row) => row.charger.userId);
		otherChargers = data.chargers.filter((row) => !row.charger.companyId && !row.charger.userId);
	}

	const handleChargerDelete = (event: any) => {
		const deletedId = event.detail;

		invalidateAll();
	};
</script>

<svelte:head>
	<title>Nabíjecí stanice – EMM</title>
</svelte:head>

<Keybinding key="n" bind:variable={dialogOpen} />

<section class="py-16 ~px-4/8">
	<div class="max-w-5xl m-auto flex flex-col gap-8">
		<!-- HEADING + ADD BUTTON -->
		<div class="flex justify-between items-center">
			<h1 class="text-3xl font-bold">Nabíjecí stanice</h1>
			{#if data.user.role === 'ADMIN'}
				<ChargerForm
					formObj={data.form}
					companies={data.companies}
					keyIcon={true}
					bind:dialogOpen
				/>
			{/if}
		</div>

		<div class="flex flex-col gap-16">
			{#if data.chargers.length === 0}
				<TableSkeleton />
			{:else}
				{#key data.chargers}
					{#each data.companies as company}
						{#if company.chargerCount > 0}
							<div class="flex flex-col gap-4">
								<h3 class="text-xl font-semibold">{company.company.name}</h3>
								<div class="grid grid-cols-2 gap-8">
									{#each companyChargers as charger}
										{#if company.company.id === charger.charger.companyId}
											<ChargerCard
												on:chargerDeleted={handleChargerDelete}
												data={charger}
												user={data.user}
											/>
										{/if}
									{/each}
								</div>
							</div>
						{/if}
					{/each}

					{#if userChargers.length > 0}
						{#each data.usersWithCharger as user}
							{@const currentUserChargers = userChargers.filter(
								(row) => row.charger.userId === user.user.id
							)}

							<div class="flex flex-col gap-4">
								<h3 class="text-xl font-semibold">Ostatní</h3>
								<div class="grid grid-cols-2 gap-8">
									{#each currentUserChargers as charger}
										<ChargerCard
											on:chargerDeleted={handleChargerDelete}
											data={charger}
											user={data.user}
										/>
									{/each}
								</div>
							</div>
						{/each}
					{/if}

					{#if otherChargers.length > 0}
						<div class="flex flex-col gap-4">
							<h3 class="text-xl font-semibold">Nepřiřazené</h3>
							<div class="grid grid-cols-2 gap-8">
								{#each otherChargers as charger}
									<ChargerCard
										on:chargerDeleted={handleChargerDelete}
										data={charger}
										user={data.user}
									/>
								{/each}
							</div>
						</div>
					{/if}
				{/key}
			{/if}
		</div>
	</div>
</section>
