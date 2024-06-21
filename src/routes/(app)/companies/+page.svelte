<script lang="ts">
	import { Input } from '$lib/components/ui/input';

	import { Search } from 'lucide-svelte';

	import CompanyForm from '$lib/components/add-form/company-form.svelte';
	import CompanyCard from '$lib/components/cards/company-card/company-card.svelte';
	import Keybinding from '$lib/components/keybinding/keybinding.svelte';
	import TableSkeleton from '$lib/components/table-skeleton/table-skeleton.svelte';

	export let data;

	// Used for tracking state of dialog
	let dialogOpen = false;

	// Used for filter
	let searchInputValue: string;
	$: sourceData = data.companies;

	const filterData = (inputValue: string) => {
		sourceData = data.companies.filter((item) =>
			item.companyTable.name.toLowerCase().includes(inputValue)
		);
	};

	const handleCompanyDelete = (event: any) => {
		const deletedId = event.detail;

		sourceData = sourceData.filter((company: any) => company.companyTable.id !== deletedId);
	};
</script>

<Keybinding key="n" bind:variable={dialogOpen} />

<section class="py-16 ~px-4/8">
	<div class="max-w-5xl m-auto flex flex-col gap-8">
		<!-- HEADING + ADD BUTTON -->
		<div class="flex justify-between items-center">
			<h1 class="text-3xl font-bold">Společnosti</h1>

			{#if sourceData.length > 0}
				<div class="relative w-full max-w-xs">
					<Input
						bind:value={searchInputValue}
						on:input={() => filterData(searchInputValue)}
						class="pl-10 w-full focus-visible:ring-0 focus-visible:ring-offset-0"
						placeholder="Hledat..."
					/>
					<Search
						size="20"
						class="absolute top-1/2 -translate-y-1/2 left-2 text-muted-foreground"
					/>
				</div>
			{/if}

			{#if data.user.role === 'ADMIN'}
				<CompanyForm {data} bind:dialogOpen />
			{/if}
		</div>
		<div class="flex flex-col gap-8">
			{#if sourceData.length === 0}
				<TableSkeleton />
			{:else}
				{#key data.companies}
					{#each sourceData as company}
						{@const graphData = data.chargingData[company.companyTable.id]}

						<CompanyCard on:companyDeleted={handleCompanyDelete} {company} user={data.user} {graphData} />
					{/each}
				{/key}
			{/if}
		</div>
	</div>
</section>
