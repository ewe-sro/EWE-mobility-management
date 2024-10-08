<script lang="ts">
	import * as HoverCard from '$lib/components/ui/hover-card';

	import { convertTimestampToDate } from '$lib/utils';

	export let lastConnected: Date | null;
</script>

<HoverCard.Root openDelay={0} closeDelay={0}>
	<HoverCard.Trigger>
		<slot />
	</HoverCard.Trigger>
	<HoverCard.Content class="flex flex-col items-center gap-1">
		{#if lastConnected}
			<span class="font-semibold">Naposledy připojeno</span>
			<span class="text-slate-200">
				{convertTimestampToDate(lastConnected, 'datetime')}
			</span>
		{:else}
			<span class="font-semibold">Zatím nepřipojeno</span>
		{/if}
	</HoverCard.Content>
</HoverCard.Root>
