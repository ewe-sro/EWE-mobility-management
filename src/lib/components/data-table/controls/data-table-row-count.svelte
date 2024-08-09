<script lang="ts">
	export let rowCount;
	export let pluginStates;

	const { pageIndex, pageSize } = pluginStates.page; // pagination

	let startCount: number;
	let endCount: number;

	$: currentPage = $pageIndex + 1;

	// Get the start record number
	$: if (currentPage === 1) {
		startCount = 1;
		endCount = $pageSize;
	} else {
		startCount = (currentPage - 1) * $pageSize + 1;
		endCount = (currentPage - 1) * $pageSize + $pageSize;
	}
</script>

<span class="text-sm text-muted-foreground">Zobrazeno {startCount}-{endCount} z {rowCount}</span>
