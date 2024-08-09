<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	import { Download } from 'lucide-svelte';

	import { exportCsv } from '$lib/utils';

	export let pluginStates;

	const { exportedData } = pluginStates.export; // data export

	console.log($exportedData);
</script>

<Button
	on:click={() => exportCsv($exportedData)}
	variant="outline"
	class="flex items-center gap-1.5 h-auto px-2 py-1.5 text-sm shadow-sm"
>
	<Download size="16" />
	Exportovat data
</Button>
