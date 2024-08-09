<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	import StatusDot from './status-dot/status-dot.svelte';

	export let status:
		| 'disconnected'
		| 'connected'
		| 'unknown'
		| 'offline'
		| string
		| null
		| undefined;
</script>

<Badge
	variant="outline"
	class="inline-flex items-center gap-1 pl-0.5 pr-2 bg-muted shadow-sm rounded-md"
>
	{#if status === 'disconnected'}
		<StatusDot variant="online" />
		<span class="text-muted-foreground">K dispozici</span>
	{:else if status === 'connected'}
		<StatusDot variant="charging" />
		<span class="text-muted-foreground">Nabíjí</span>
	{:else if status === 'offline'}
		<StatusDot variant="offline" />
		<span class="text-muted-foreground">Offline</span>
	{/if}
</Badge>
