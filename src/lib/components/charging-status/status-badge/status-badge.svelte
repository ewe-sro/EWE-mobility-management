<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	export let variant: 'online' | 'offline' | 'unavailable' | 'charging';

	let style: string;

	switch (variant) {
		case 'online':
			style = 'bg-lime-500 border-lime-700';
			break;
		case 'offline':
			style = 'bg-red-500 border-red-700';
			break;
		case 'unavailable':
			style = 'bg-amber-500 border-amber-700';
			break;
		case 'charging':
			style = 'bg-sky-500 border-sky-700';
			break;
	}
</script>

<Badge class="relative text-white {style}">
	<slot />
	{#if variant === 'charging'}
		<span class="animate-ping absolute h-full w-full rounded-full bg-sky-400 opacity-75"></span>
	{/if}
</Badge>
