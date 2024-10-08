<script>
	import * as Table from '$lib/components/ui/table';

	export let tableData;
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<!-- RENDER THE HEADER COLUMN OF THE CSV -->
			{#each tableData[0] as value}
				<Table.Head>{value}</Table.Head>
			{/each}
		</Table.Row>
	</Table.Header>
	<Table.Body>
		<!-- RENDER FIRST 5 ROWS OF THE CSV -->
		{#each tableData.slice(1, 6) as row}
			<Table.Row>
				{#each row as value}
					<Table.Cell class="whitespace-nowrap">{value}</Table.Cell>
				{/each}
			</Table.Row>
		{/each}
		{#if tableData.length > 7}
			<Table.Row>
				<Table.Cell class="py-2 text-muted-foreground" colspan={tableData[0].length}
					>... dalších {tableData.length - 6} řádků</Table.Cell
				>
			</Table.Row>
		{/if}
	</Table.Body>
</Table.Root>
