<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	import { Download } from 'lucide-svelte';

	import { exportCsv } from '$lib/utils';

	export let pluginStates;
	export let dataLength;
	export let hiddenColumnsIds: string[];

	const { exportedData } = pluginStates.export; // data export

	const exportAllDataCsv = () => {
		const initialColumnsIds = hiddenColumnsIds;

		// Display all of the data table columns
		hiddenColumnsIds = [];

		// Export data table to CSV
		exportCsv($exportedData);

		// Reset the hidden columns
		hiddenColumnsIds = initialColumnsIds;
	};
</script>

<Button
	on:click={exportAllDataCsv}
	variant="outline"
	class="flex items-center gap-1.5 h-auto px-2 py-1.5 text-sm shadow-sm"
	disabled={dataLength === 0}
>
	<Download size="16" />
	Exportovat data
</Button>
