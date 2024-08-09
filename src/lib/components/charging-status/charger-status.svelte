<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	import StatusDot from './status-dot/status-dot.svelte';

	import { getDateDifference } from '$lib/utils';

	export let status;

	let className: undefined | string = undefined;
	export { className as class };
</script>

<Badge
	variant="outline"
	class="inline-flex items-center gap-1 pl-1 pr-2 border rounded-md {className}"
>
	<StatusDot variant={status} />
	{#if status === 'online'}
		<span class="text-muted-foreground">Online</span>
	{:else if status === 'unavailable'}
		<span class="text-muted-foreground">Nedostupné</span>
	{:else if status === 'offline'}
		<span class="text-muted-foreground">Offline</span>
	{/if}
</Badge>
