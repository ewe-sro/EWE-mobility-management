<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	import StatusDot from './status-dot/status-dot.svelte';

	export let status: 'charging' | 'finished';
</script>

<Badge
	variant="outline"
	class="inline-flex items-center gap-1 pl-0.5 pr-2 bg-muted shadow-sm rounded-md"
>
	{#if status === 'finished'}
		<StatusDot variant="online" />
		<span class="text-muted-foreground">Dokončeno</span>
	{:else if status === 'charging'}
		<StatusDot variant="charging" />
		<span class="text-muted-foreground">Nabíjí</span>
	{/if}
</Badge>
