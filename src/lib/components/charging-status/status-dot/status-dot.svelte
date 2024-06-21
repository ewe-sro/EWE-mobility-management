<script lang="ts">
	export let variant: 'online' | 'offline' | 'unavailable' | 'charging';
	export let value: string | undefined = undefined;

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

<div class="inline-flex items-center gap-2 p-1">
	<span class="relative flex h-2.5 w-2.5">
		{#if variant === 'charging'}
			<span
				class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"
			></span>
		{/if}
		<span class="relative inline-flex rounded-full h-full w-full border {style}"></span>
		{#if value}
			<span class="hidden">{value}</span>
		{/if}
	</span>
</div>
