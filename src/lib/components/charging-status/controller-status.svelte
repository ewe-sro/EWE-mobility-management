<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	import StatusDot from './status-dot/status-dot.svelte';

	import { cn, getControllerStatus } from '$lib/utils';

	export let connectedState: 'disconnected' | 'connected' | 'offline';

	const status = getControllerStatus(connectedState);

	let className: string | null = null;
	export { className as class };
</script>

<Badge
	variant="outline"
	class={cn(
		'text-[0.6875rem] inline-flex ite	ms-center gap-0.5 py-px pl-0.5 pr-1.5 border-none',
		status === 'disconnected' && 'border-lime-700 dark:border-lime-300',
		status === 'connected' && 'border-sky-700 dark:border-sky-300',
		status === 'offline' && 'border-red-700 dark:border-red-300',
		className
	)}
>
	{#if status === 'disconnected'}
		<StatusDot variant="online" size="xs" />
		<span class="leading-none text-lime-700 dark:text-lime-300 pb-0.5">K dispozici</span>
	{:else if status === 'connected'}
		<StatusDot variant="charging" size="xs" />
		<span class="leading-none text-sky-700 dark:text-sky-300 pb-0.5">Nabíjí</span>
	{:else if status === 'offline'}
		<StatusDot variant="offline" size="xs" />
		<span class="leading-none text-red-700 dark:text-red-300 pb-0.5">Offline</span>
	{/if}
</Badge>
