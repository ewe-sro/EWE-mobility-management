<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Collapsible from '$lib/components/ui/collapsible';

	import FavoriteButton from './misc/favorite-button.svelte';
	import ExpandButton from './misc/expand-button.svelte';
	import CollapseButton from './misc/collapse-button.svelte';
	import DragHandleButton from './misc/drag-handle-button.svelte';

	import { Plus, Minus } from 'lucide-svelte';

	import { cn } from '$lib/utils';

	import { dashboardCollapsed } from '$lib/stores';

	export let company;
	export let chargerIds: number[]; // Array of ids of chargers associated with company

	// Check if the collapsible has a state record in a store
	$: collapsibleOpen = $dashboardCollapsed.companies[company.company.id] || false;

	// Function for toggling the collapsible - writes the changes to the store
	const toggleCollapsible = () => {
		$dashboardCollapsed.companies[company.company.id] = !collapsibleOpen;
	};
</script>

<Collapsible.Root bind:open={collapsibleOpen} class={cn(collapsibleOpen && 'pb-6')}>
	<Collapsible.Trigger
		on:click={toggleCollapsible}
		class="relative flex items-center gap-4 w-full p-6"
	>
		<Button variant="ghost" size="sm" class="h-8 w-8 p-1 text-muted-foreground">
			{#if !collapsibleOpen}
				<Plus size={16} />
			{:else}
				<Minus size={16} />
			{/if}
			<span class="sr-only">Toggle</span>
		</Button>

		<h2 class="text-lg font-semibold">{company.company.name}</h2>

		<div class="ml-auto flex gap-4">
			<div>
				<ExpandButton companyId={company.company.id} {chargerIds} />
				<CollapseButton companyId={company.company.id} {chargerIds} />
				<FavoriteButton {company} />
			</div>
			<DragHandleButton />
		</div>
	</Collapsible.Trigger>
	<Collapsible.Content
		class="relative flex flex-col gap-6 ml-6 pl-12 pt-4 px-6 before:absolute before:top-0 before:left-4 before:h-full before:w-0.5 before:bg-border"
	>
		<slot />
	</Collapsible.Content>
</Collapsible.Root>
