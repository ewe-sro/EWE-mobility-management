<script lang="ts">
	import ChargerForm from '$lib/components/add-form/charger-form.svelte';
	import ChargerCard from '$lib/components/cards/charger-card/charger-card.svelte';
	import Keybinding from '$lib/components/keybinding/keybinding.svelte';

	export let data;

	// Used for tracking state of dialog
	let dialogOpen = false;

	const handleChargerDelete = (event: any) => {
		const deletedId = event.detail;

		data.chargers = data.chargers.filter((charger: any) => charger.charger.id !== deletedId);
	};
</script>

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
					users={data.users}
					keyIcon={true}
					bind:dialogOpen
				/>
			{/if}
		</div>

		<div class="flex flex-col gap-16">
			{#key data.chargers}
				{#each data.companies as company}
					{#if company.chargerCount > 0}
						<div class="flex flex-col gap-4">
							<h3 class="text-xl font-semibold">{company.company.name}</h3>
							<div class="grid grid-cols-2 gap-8">
								{#each data.chargers as charger}
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

				<div class="flex flex-col gap-4">
					<h3 class="text-xl font-semibold">Ostatní</h3>
					<div class="grid grid-cols-2 gap-8">
						{#each data.chargers as charger}
							{#if charger.charger.companyId === null}
								<ChargerCard
									on:chargerDeleted={handleChargerDelete}
									data={charger}
									user={data.user}
								/>
							{/if}
						{/each}
					</div>
				</div>
			{/key}
		</div>
	</div>
</section>
