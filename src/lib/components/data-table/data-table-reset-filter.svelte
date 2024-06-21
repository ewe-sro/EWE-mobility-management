<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { Button } from '$lib/components/ui/button';

	const dispatch = createEventDispatcher();

	export let pluginStates;

	const { filterValues } = pluginStates.colFilter; // column filter

	const filterReset = () => {
		dispatch('filterReset');
	};

	let filterActive: boolean;

	// Loop over the filterValues and check if any filter is active
	$: for (const filter in $filterValues) {
		if ($filterValues[filter] !== undefined) {
			filterActive = true;
			break;
		} else {
			filterActive = false;
		}
	}
</script>

{#if filterActive}
	<Button class="h-auto p-0" variant="link" on:click={filterReset}>Resetovat filtry</Button>
{/if}
