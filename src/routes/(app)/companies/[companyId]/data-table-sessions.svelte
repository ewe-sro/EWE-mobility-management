<script lang="ts">
	import { readable } from 'svelte/store';

	import { createTable, createRender, Render, Subscribe } from 'svelte-headless-table';
	import { addGridLayout, addSortBy, addHiddenColumns } from 'svelte-headless-table/plugins';

	import * as Table from '$lib/components/ui/table';

	import DataTableSort from '$lib/components/data-table/controls/data-table-sort.svelte';
	import StatusDot from '$lib/components/charging-status/status-dot/status-dot.svelte';

	import { convertEnergyPower, convertTimestampToDate, convertSecondstoTime } from '$lib/utils';

	export let data;

	// Create a table object from supplied data and use plugins for filtering etc.
	const tableData = readable(data);
	const table = createTable(tableData, {
		grid: addGridLayout(),
		sort: addSortBy({
			initialSortKeys: [
				{
					id: 'id',
					order: 'desc'
				}
			],
			disableMultiSort: true,
			toggleOrder: ['asc', 'desc']
		}),
		hide: addHiddenColumns()
	});

	// Declare the data table columns
	const columns = table.createColumns([
		table.column({
			accessor: (item) => item.chargingSession.id,
			id: 'id',
			header: 'ID',
			plugins: {
				sort: {
					disable: false
				}
			}
		}),
		table.column({
			accessor: (item) => item.charger.id,
			id: 'chargerId',
			header: 'ID nabíjecí stanice',
			plugins: {
				sort: {
					disable: false
				}
			}
		}),
		table.column({
			accessor: (item) => item.controller.id,
			id: 'controllerId',
			header: 'ID nabíjecího kontroleru',
			plugins: {
				sort: {
					disable: false
				}
			}
		}),
		table.column({
			accessor: (item) => item.chargingSession.endTimestamp,
			id: 'state',
			header: 'Stav',
			cell: ({ value }) => {
				return createRender(StatusDot, { variant: value !== null ? 'online' : 'charging' });
			},
			plugins: {
				sort: {
					disable: true
				}
			}
		}),
		table.column({
			accessor: (item) => item.charger.description,
			id: 'description',
			header: 'Nabíjecí stanice',
			plugins: {
				sort: {
					disable: false
				}
			}
		}),
		table.column({
			accessor: (item) => item.controller.chargingPointName,
			id: 'chargingPoint',
			header: 'Nabíjecí bod',
			plugins: {
				sort: {
					disable: false
				}
			}
		}),
		table.column({
			accessor: (item) => item.chargingSession.startTimestamp,
			id: 'startTimestamp',
			header: 'Začátek nabíjení',
			cell: ({ value }) => {
				return convertTimestampToDate(value, 'datetime');
			},
			plugins: {
				sort: {
					disable: false
				}
			}
		}),
		table.column({
			accessor: (item) => item.chargingSession.endTimestamp,
			id: 'endTimestamp',
			header: 'Konec nabíjení',
			cell: ({ value }) => {
				return convertTimestampToDate(value, 'datetime');
			},
			plugins: {
				sort: {
					disable: false
				}
			}
		}),
		table.column({
			accessor: (item) => item.chargingSession.duration,
			id: 'duration',
			header: 'Čas nabíjení',
			cell: ({ value }) => {
				return convertSecondstoTime(value);
			},
			plugins: {
				sort: {
					disable: false
				}
			}
		}),
		table.column({
			accessor: (item) => item.chargingSession.consumption,
			id: 'consumption',
			header: 'Spotřeba',
			cell: ({ value }) => {
				return convertEnergyPower(Number(value), 'Wh');
			},
			plugins: {
				sort: {
					disable: false,
					getSortValue: (value) => Number(value)
				}
			}
		})
	]);

	const {
		headerRows,
		pageRows,
		tableAttrs,
		tableHeadAttrs,
		tableBodyAttrs,
		pluginStates,
		flatColumns,
		originalRows
	} = table.createViewModel(columns);

	const { hiddenColumnIds } = pluginStates.hide; // column visibility

	// Hidden columns by default
	const hiddenColumns = ['id', 'chargerId', 'controllerId'];

	const ids = flatColumns.map((col) => col.id);
	let hideForId = Object.fromEntries(ids.map((id) => [id, !hiddenColumns.includes(id)]));

	$: $hiddenColumnIds = Object.entries(hideForId)
		.filter(([, hide]) => !hide)
		.map(([id]) => id);
</script>

<div class="w-full overflow-x-auto">
	<Table.Root {...$tableAttrs}>
		<Table.Header {...$tableHeadAttrs}>
			{#each $headerRows as headerRow (headerRow.id)}
				<Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
					<Table.Row class="hover:bg-transparent" {...rowAttrs}>
						{#each headerRow.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
								<Table.Head
									{...attrs}
									class="group inline-flex items-center gap-1 h-auto mb-2 px-2 py-2 bg-slate-100 first:border-l last:border-r border-y
									first:rounded-l-lg last:rounded-r-lg whitespace-nowrap"
								>
									{#if !props.sort.disabled}
										<DataTableSort {pluginStates} cellId={cell.id}>
											<Render of={cell.render()} />
										</DataTableSort>
									{:else}
										<span class="px-2">
											<Render of={cell.render()} />
										</span>
									{/if}
								</Table.Head>
							</Subscribe>
						{/each}
					</Table.Row>
				</Subscribe>
			{/each}
		</Table.Header>
		<Table.Body {...$tableBodyAttrs}>
			{#each $pageRows as row (row.id)}
				<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
					<Table.Row {...rowAttrs} class="*:hover:bg-muted/75 *:last:border-0">
						{#each row.cells as cell (cell.id)}
							{@const currentRow = $originalRows[Number(row.id)]}
							<Subscribe attrs={cell.attrs()} let:attrs>
								<Table.Cell
									{...attrs}
									class="flex w-full p-0 border-b first:rounded-l-md last:rounded-r-md
									*:h-full *:w-full *:px-4 *:py-1.5 *:inline-flex *:items-center whitespace-nowrap"
								>
									{#if cell.render() !== 'null' && cell.render() !== 'undefined'}
										<a
											href="/chargers/{currentRow.cells[1].render()}/charging-controller/{currentRow.cells[2].render()}/charging-session/{currentRow.cells[0].render()}"
										>
											<Render of={cell.render()} />
										</a>
									{:else}
										<a
											href="/chargers/{currentRow.cells[1].render()}/charging-controller/{currentRow.cells[2].render()}/charging-session/{currentRow.cells[0].render()}"
										>
										</a>
									{/if}
								</Table.Cell>
							</Subscribe>
						{/each}
					</Table.Row>
				</Subscribe>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
