<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';

	export let dataLength: number;
</script>

{#if dataLength > 0}
	<slot />
{:else}
	<div class="relative h-48 w-full">
		<Skeleton class="h-full w-full border" />
		<p class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-muted-foreground">
			Zdá se, že tu nic není
		</p>
	</div>
{/if}
