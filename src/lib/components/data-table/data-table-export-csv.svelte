<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	import { Download } from 'lucide-svelte';

	import { getTodaysDate } from '$lib/utils';

	export let pluginStates;

	const { exportedData } = pluginStates.export; // data export

	export const exportCsv = (data: any) => {
		const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });

		// Create a hidden link used for downloading the CSV
		const hiddenElement = document.createElement('a');

		// Create a URL for the Blob and set it as the href attribute
		const url = URL.createObjectURL(blob);
		hiddenElement.href = url;

		const { year, month, day, hours, minutes } = getTodaysDate();
		hiddenElement.download = `charging_data_export_${day}${month}${year}-${hours}${minutes}.csv`;

		hiddenElement.click();
		hiddenElement.remove();

		// Revoke the object URL after the download is triggered
		URL.revokeObjectURL(url);
	};
</script>

<Button
	on:click={() => exportCsv($exportedData)}
	variant="outline"
	class="flex items-center gap-1.5 h-auto px-2 py-1.5 text-sm shadow-sm"
>
	<Download size="16" />
	Exportovat data
</Button>
