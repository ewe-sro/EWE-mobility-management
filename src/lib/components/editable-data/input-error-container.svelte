<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';

	import { TriangleAlert } from 'lucide-svelte';
</script>

<Tooltip.Root openDelay={0} closeDelay={150}>
	<Tooltip.Trigger
		class="absolute top-1/2 right-2 -translate-y-1/2 !mt-0 p-1.5 bg-red-100 text-red-600 rounded"
	>
		<TriangleAlert size="16" />
	</Tooltip.Trigger>
	<Tooltip.Content side="bottom" class="max-w-sm text-center">
		<slot />
	</Tooltip.Content>
</Tooltip.Root>
