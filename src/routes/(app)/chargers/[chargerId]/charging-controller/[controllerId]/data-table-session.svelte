<script lang="ts">
	import { readable } from 'svelte/store';

	import { Separator } from '$lib/components/ui/separator';

	import { createTable, createRender, Render, Subscribe } from 'svelte-headless-table';
	import {
		addGridLayout,
		addSortBy,
		addHiddenColumns,
		addColumnFilters,
		addPagination,
		addDataExport
	} from 'svelte-headless-table/plugins';

	import * as Table from '$lib/components/ui/table';

	import DataTableSort from '$lib/components/data-table/data-table-sort.svelte';
	import DataTableColumnFilter from '$lib/components/data-table/data-table-column-filter.svelte';
	import DataTableResetFilter from '$lib/components/data-table/data-table-reset-filter.svelte';
	import DataTableDatePicker from '$lib/components/data-table/data-table-date-picker.svelte';
	import DataTableExportCsv from '$lib/components/data-table/data-table-export-csv.svelte';
	import DataTablePaginationCount from '$lib/components/data-table/data-table-pagination-count.svelte';
	import DataTablePaginationNav from '$lib/components/data-table/data-table-pagination-nav.svelte';
	import DataTableRowCount from '$lib/components/data-table/data-table-row-count.svelte';
	import StatusDot from '$lib/components/charging-status/status-dot/status-dot.svelte';

	import { textFilter, stateFilter, rangeFilter } from '$lib/components/data-table/filters';

	import { convertEnergyPower, convertTimestampToDate, convertSecondstoTime } from '$lib/utils';
	import type { DateRange } from 'bits-ui';
	import type { DateValue } from '@internationalized/date';

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
		hide: addHiddenColumns(),
		colFilter: addColumnFilters(),
		page: addPagination(),
		export: addDataExport({
			format: 'csv'
		})
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
				},
				export: {
					exclude: false
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
				},
				export: {
					exclude: true
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
				},
				export: {
					exclude: true
				}
			}
		}),
		table.column({
			accessor: (item) => item.chargingSession.endTimestamp,
			id: 'state',
			header: 'Stav',
			cell: ({ value }) => {
				return createRender(StatusDot, {
					variant: value !== null ? 'online' : 'charging',
					value: value !== null ? 'online' : 'charging'
				});
			},
			plugins: {
				sort: {
					disable: true
				},
				export: {
					exclude: true
				},
				colFilter: {
					fn: stateFilter
				}
			}
		}),
		table.column({
			accessor: (item) => item.charger.description,
			id: 'description',
			header: 'Nabíjecí stanice',
			plugins: {
				sort: {
					disable: true
				},
				export: {
					exclude: false
				},
				colFilter: {
					fn: textFilter
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
				},
				export: {
					exclude: false
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
				},
				export: {
					exclude: false
				},
				colFilter: {
					fn: rangeFilter
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
				},
				export: {
					exclude: false
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
				},
				export: {
					exclude: false
				}
			}
		}),
		table.column({
			accessor: (item) => item.charger.rfidTag,
			id: 'rfidTag',
			header: 'RFID',
			plugins: {
				sort: {
					disable: true
				},
				export: {
					exclude: false
				}
			}
		}),
		table.column({
			accessor: (item) => item.charger.rfidTimestamp,
			id: 'rfidTimestamp',
			header: 'RFID časové razítko',
			plugins: {
				sort: {
					disable: true
				},
				export: {
					exclude: false
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
		originalRows,
		rows
	} = table.createViewModel(columns);

	const { hiddenColumnIds } = pluginStates.hide; // column visibility
	const { filterValues } = pluginStates.colFilter; // column filter

	// Hidden columns by default
	const hiddenColumns = ['id', 'chargerId', 'controllerId', 'rfidTag', 'rfidTimestamp'];

	const ids = flatColumns.map((col) => col.id);
	let hideForId = Object.fromEntries(ids.map((id) => [id, !hiddenColumns.includes(id)]));

	$: $hiddenColumnIds = Object.entries(hideForId)
		.filter(([, hide]) => !hide)
		.map(([id]) => id);

	// Reset all filter values
	let datePickerValue: DateRange | undefined;
	let datePickerStartValue: DateValue | undefined;

	const resetFilterVariables = () => {
		// Reset the range datepicker
		datePickerValue = undefined;
		datePickerStartValue = undefined;

		$filterValues = {};
	};
</script>

<div class="flex justify-between items-end">
	<div class="flex items-center gap-4">
		<DataTableColumnFilter {pluginStates} />
		<DataTableResetFilter {pluginStates} on:filterReset={resetFilterVariables} />
	</div>
	<div class="flex items-center gap-2">
		<DataTableDatePicker
			{pluginStates}
			bind:value={datePickerValue}
			bind:startValue={datePickerStartValue}
		/>
		<DataTableExportCsv {pluginStates} />
	</div>
</div>

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

<div class="flex justify-between items-center">
	<DataTableRowCount {pluginStates} rowCount={$rows.length} />
	<div class="flex items-center gap-1.5">
		<DataTablePaginationCount {pluginStates} />
		<Separator orientation="vertical" />
		<DataTablePaginationNav {pluginStates} />
	</div>
</div>
