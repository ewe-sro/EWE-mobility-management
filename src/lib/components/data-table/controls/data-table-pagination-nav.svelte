<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-svelte';

	export let pluginStates;

	const { pageIndex, pageCount, hasNextPage, hasPreviousPage } = pluginStates.page; // pagination
</script>

<div class="flex items-center gap-1.5">
	<Button
		disabled={!$hasPreviousPage}
		on:click={() => $pageIndex--}
		variant="ghost"
		class="aspect-square p-2 text-muted-foreground"
	>
		<ChevronLeft size={16} />
	</Button>
	<Button
		disabled={!$hasNextPage}
		on:click={() => $pageIndex++}
		variant="ghost"
		class="aspect-square p-2 text-muted-foreground"
	>
		<ChevronRight size={16} />
	</Button>
</div>
