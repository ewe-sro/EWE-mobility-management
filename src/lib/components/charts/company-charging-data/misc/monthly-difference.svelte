<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	import { ArrowUp, ArrowDown } from 'lucide-svelte';

	import { cn, round } from '$lib/utils';

	export let lastMonth;
	export let thisMonth;

	let monthlyDifference = ((thisMonth - lastMonth) / Math.abs(thisMonth)) * 100;
</script>

{#if lastMonth > 0}
	<Badge
		class={cn(
			'flex items-center gap-1 py-0.5 px-1.5 font-medium rounded-md',
			monthlyDifference > 0 && 'text-lime-600 bg-lime-100 border-lime-600',
			monthlyDifference < 0 && 'text-red-600 bg-red-100 border-red-600'
		)}
		variant="outline"
	>
		{#if monthlyDifference > 0}
			<ArrowUp size="14" />
		{:else}
			<ArrowDown size="14" />
		{/if}
		{round(monthlyDifference, 1)} %
	</Badge>
{/if}
