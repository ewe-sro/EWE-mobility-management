<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Collapsible from '$lib/components/ui/collapsible';

	import ChargerStatus from '$lib/components/charging-status/charger-status.svelte';
	import LastConnectedHoverCard from '$lib/components/last-connected-hover-card/last-connected-hover-card.svelte';
	import LinkButton from '$lib/components/buttons/link-button.svelte';

	import { Plus, Minus } from 'lucide-svelte';

	import { emptyStringOnNull } from '$lib/utils';
	import { dashboardCollapsed } from '$lib/stores';

	export let charger;
	export let controllerLength: number;

	$: collapsibleOpen = $dashboardCollapsed.chargers[charger.charger.id];

	const toggleCollapsible = () => {
		$dashboardCollapsed.chargers[charger.charger.id] = !collapsibleOpen;
	};
</script>

<Collapsible.Root bind:open={collapsibleOpen}>
	<div class="flex items-center gap-4 pb-2">
		<Button
			on:click={toggleCollapsible}
			disabled={controllerLength === 0}
			variant="ghost"
			size="sm"
			class="h-7 w-7 p-1 text-muted-foreground
                relative before:absolute before:top-1/2 before:-translate-y-1/2 before:-left-8 before:w-6 before:h-0.5 before:bg-border"
		>
			{#if !collapsibleOpen || controllerLength === 0}
				<Plus size={14} />
			{:else}
				<Minus size={14} />
			{/if}
			<span class="sr-only">Toggle</span>
		</Button>
		<Collapsible.Trigger
			class="flex-1"
			on:click={toggleCollapsible}
			disabled={controllerLength === 0}
		>
			<Card.Root class="flex justify-between gap-4 w-full p-4 bg-muted">
				<div class="flex flex-col items-start">
					<h3 class="font-semibold">{charger.charger.name}</h3>
					<span class="text-sm text-muted-foreground"
						>{emptyStringOnNull(charger.charger.description)}</span
					>
				</div>
				<div class="flex items-center gap-2">
					<LastConnectedHoverCard lastConnected={charger.charger.lastConnected}>
						<ChargerStatus lastConnected={charger.charger.lastConnected} />
					</LastConnectedHoverCard>
					<LinkButton href="/chargers/{charger.charger.id}" iconSize={14}
						>Zobrazit detail nabíjecí stanice</LinkButton
					>
				</div>
			</Card.Root>
		</Collapsible.Trigger>
	</div>
	{#if controllerLength > 0}
		<Collapsible.Content
			class="relative flex flex-col gap-2 pl-16 pt-1 pb-2 before:absolute before:top-0 before:left-3.5 before:h-full before:w-0.5 before:bg-border"
		>
			<slot />
		</Collapsible.Content>
	{/if}
</Collapsible.Root>
