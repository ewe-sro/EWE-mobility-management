<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as HoverCard from '$lib/components/ui/hover-card';

	import { UnfoldVertical } from 'lucide-svelte';

	import { dashboardCollapsed } from '$lib/stores';

	export let companyId: number;
	export let chargerIds: number[]; // Array of ids of chargers associated with company

	let className: string | undefined = undefined;
	export { className as class };

	const expandAll = (event: Event) => {
		event.stopPropagation();

		// Expand the company collapsible
		$dashboardCollapsed.companies[companyId] = true;

		// Expand all of the charger collapsibles
		for (const id of chargerIds) {
			$dashboardCollapsed.chargers[id] = true;
		}
	};
</script>

<HoverCard.Root openDelay={0} closeDelay={0}>
	<HoverCard.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			on:click={(event) => expandAll(event)}
			variant="ghost"
			size="sm"
			class="h-8 w-8 p-1 text-muted-foreground {className}"
		>
			<UnfoldVertical size={16} />
			<span class="sr-only">Rozbalit vše</span>
		</Button>
	</HoverCard.Trigger>
	<HoverCard.Content>Rozbalit vše</HoverCard.Content>
</HoverCard.Root>
