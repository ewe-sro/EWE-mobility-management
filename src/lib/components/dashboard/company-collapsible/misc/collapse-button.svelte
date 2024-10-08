<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as HoverCard from '$lib/components/ui/hover-card';

	import { FoldVertical } from 'lucide-svelte';

	import { dashboardCollapsed } from '$lib/stores';

	export let companyId: number;
	export let chargerIds: number[]; // Array of ids of chargers associated with company

	let className: string | undefined = undefined;
	export { className as class };

	const collapseAll = (event: Event) => {
		event.stopPropagation();

		// Expand the company collapsible
		$dashboardCollapsed.companies[companyId] = false;

		// Expand all of the charger collapsibles
		for (const id of chargerIds) {
			$dashboardCollapsed.chargers[id] = false;
		}
	};
</script>

<HoverCard.Root openDelay={0} closeDelay={0}>
	<HoverCard.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			on:click={(event) => collapseAll(event)}
			variant="ghost"
			size="sm"
			class="h-8 w-8 p-1 text-muted-foreground {className}"
		>
			<FoldVertical size={16} />
			<span class="sr-only">Sbalit vše</span>
		</Button>
	</HoverCard.Trigger>
	<HoverCard.Content>Sbalit vše</HoverCard.Content>
</HoverCard.Root>
