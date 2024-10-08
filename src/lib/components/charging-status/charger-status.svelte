<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	import StatusDot from './status-dot/status-dot.svelte';

	import { cn, getChargerStatus } from '$lib/utils';

	export let lastConnected;

	let className: undefined | string = undefined;
	export { className as class };

	let status = getChargerStatus(lastConnected);
</script>

<Badge
	variant="outline"
	class={cn(
		'inline-flex items-center gap-1 py-px pl-0.5 pr-1.5',
		status === 'online' && 'border-lime-700 dark:border-lime-300',
		status === 'unavailable' && 'border-amber-700 dark:border-amber-300',
		status === 'offline' && 'border-red-700 dark:border-red-300',
		className
	)}
>
	<StatusDot variant={status} />
	{#if status === 'online'}
		<span class="leading-none text-lime-700 dark:text-lime-300 pb-0.5">Online</span>
	{:else if status === 'unavailable'}
		<span class="leading-none text-amber-700 dark:text-amber-300 pb-0.5">Nedostupné</span>
	{:else if status === 'offline'}
		<span class="leading-none text-red-700 dark:text-red-300 pb-0.5">Offline</span>
	{/if}
</Badge>
