<script lang="ts">
	import * as HoverCard from '$lib/components/ui/hover-card';
	import { Button } from '$lib/components/ui/button';

	import { Eye, EyeOff } from 'lucide-svelte';

	export let show: boolean;
</script>

<HoverCard.Root openDelay={0} closeDelay={0}>
	<HoverCard.Trigger>
		<Button
			variant="ghost"
			class="h-auto p-1.5 !m-0 text-muted-foreground hover:text-black dark:hover:text-white"
			on:click={() => (show = !show)}
		>
			{#if !show}
				<Eye size="16" />
			{:else}
				<EyeOff size="16" />
			{/if}
		</Button>
	</HoverCard.Trigger>
	<HoverCard.Content>
		<slot />
	</HoverCard.Content>
</HoverCard.Root>
