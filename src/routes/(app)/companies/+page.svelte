<script lang="ts">
	import CompanyForm from '$lib/components/add-form/company-form.svelte';
	import CompanyCard from '$lib/components/cards/company-card/company-card.svelte';
	import Keybinding from '$lib/components/keybinding/keybinding.svelte';
	import TableSkeleton from '$lib/components/table-skeleton/table-skeleton.svelte';

	export let data;

	// Used for tracking state of dialog
	let dialogOpen = false;
</script>

<Keybinding key="n" bind:variable={dialogOpen} />

<section class="py-16 ~px-4/8">
	<div class="max-w-5xl m-auto flex flex-col gap-8">
		<!-- HEADING + ADD BUTTON -->
		<div class="flex justify-between items-center">
			<h1 class="text-3xl font-bold">Společnosti</h1>

			{#if data.user.role === 'ADMIN'}
				<CompanyForm {data} bind:dialogOpen />
			{/if}
		</div>
		<div class="flex flex-col gap-8">
			{#if data.companies.length === 0}
				<TableSkeleton />
			{:else}
				{#key data.companies}
					{#each data.companies as company}
						{@const chargingData = data.chargingData[company.companyTable.id]}
						{@const employeeCount = data.employeeCount.filter(
							(row) => row.companyId === company.companyTable.id
						)}

						<CompanyCard {company} {employeeCount} user={data.user} {chargingData} />
					{/each}
				{/key}
			{/if}
		</div>
	</div>
</section>
