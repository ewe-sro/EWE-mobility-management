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

	import DataTableSort from '$lib/components/data-table/controls/data-table-sort.svelte';

	import DataTableStateFilter from '$lib/components/data-table/column-filters/state-filter.svelte';
	import DataTableTextFilter from '$lib/components/data-table/column-filters/text-filter.svelte';
	import DataTableResetFilter from '$lib/components/data-table/controls/data-table-reset-filter.svelte';

	import DataTableDatePicker from '$lib/components/data-table/controls/data-table-date-picker.svelte';
	import DataTableExportCsv from '$lib/components/data-table/controls/data-table-export-csv.svelte';
	import DataTableImportCsv from '$lib/components/data-table/controls/import-csv/data-table-import-csv.svelte';
	import DataTablePaginationCount from '$lib/components/data-table/controls/data-table-pagination-count.svelte';
	import DataTablePaginationNav from '$lib/components/data-table/controls/data-table-pagination-nav.svelte';
	import DataTableRowCount from '$lib/components/data-table/controls/data-table-row-count.svelte';

	import TableSkeleton from '$lib/components/table-skeleton/table-skeleton.svelte';
	import StatusDot from '$lib/components/charging-status/status-dot/status-dot.svelte';

	import ShowToAdminsManagersAndEmployees from '$lib/components/role-container/show-to-admins-managers-and-employees.svelte';
	import ShowToAdminsAndManagers from '$lib/components/role-container/show-to-admins-and-managers.svelte';

	import { textFilter, stateFilter, rangeFilter } from './column-filters/filters';

	import { convertEnergyPower, convertTimestampToDate, convertSecondsToTime } from '$lib/utils';
	import type { DateRange } from 'bits-ui';
	import type { DateValue } from '@internationalized/date';
	import { invalidateAll } from '$app/navigation';

	import type { DatabaseUserAttributes } from '$lib/server/auth';

	export let data: any[];
	export let showController: boolean = false;

	export let showControls: boolean = true;
	export let user: DatabaseUserAttributes | undefined = undefined;
	export let userInCompany:
		| {
				role: string | null;
				userId: string;
				companyId: number;
				rfidTag: string | null;
				rfidValidTill: Date | null;
		  }
		| undefined = undefined;

	// If user is a userInCompany is a quest disable controls
	if (userInCompany?.role === 'Host') showControls = false;

	// Create a table object from supplied data and use plugins for filtering etc.
	const tableData = readable(data);
	const table = createTable(tableData, {
		grid: addGridLayout(),
		sort: addSortBy({
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
					exclude: false
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
				}
			}
		}),
		table.column({
			accessor: (item) => item.controller.chargingPointName,
			id: 'chargingPointName',
			header: 'Nabíjecí bod',
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
			accessor: (item) => convertTimestampToDate(item.chargingSession.startTimestamp, 'datetime'),
			id: 'startTimestamp',
			header: 'Začátek nabíjení',
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
			accessor: (item) => convertTimestampToDate(item.chargingSession.endTimestamp, 'datetime'),
			id: 'endTimestamp',
			header: 'Konec nabíjení',
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
			accessor: (item) => convertSecondsToTime(item.chargingSession.duration),
			id: 'duration',
			header: 'Čas nabíjení',
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
			accessor: (item) => item.chargingSession.startRealPower,
			id: 'startRealPower',
			header: 'Celková spotřeba energie - začátek',
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
			accessor: (item) => item.chargingSession.endRealPower,
			id: 'endRealPower',
			header: 'Celková spotřeba energie - konec',
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
			accessor: (item) => item.chargingSession.rfidTag,
			id: 'rfidTag',
			header: 'RFID',
			plugins: {
				sort: {
					disable: false
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
			accessor: (item) => convertTimestampToDate(item.chargingSession.rfidTimestamp, 'datetime'),
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
		}),
		table.column({
			accessor: (item) => (item.employee ? item.employee.email : item.rfidDescription),
			id: 'rfidIdentifier',
			header: 'RFID identifikátor',
			plugins: {
				sort: {
					disable: false
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
	let hiddenColumns = [
		'id',
		'chargerId',
		'controllerId',
		'startRealPower',
		'endRealPower',
		'rfidTimestamp'
	];

	if (!showController) hiddenColumns.push('chargingPointName');

	// Get IDs of all columns
	const ids = flatColumns.map((col) => col.id);
	// Pair the IDs of the table and values from 'hiddenColumns' variable
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

<div class="flex flex-col gap-4 w-full overflow-x-auto">
	<div class="flex justify-between items-end">
		<div class="flex items-center gap-2">
			<DataTableStateFilter {pluginStates} dataLength={data.length} />
			{#if showControls}
				<ShowToAdminsManagersAndEmployees {user} {userInCompany}>
					<DataTableTextFilter
						{pluginStates}
						dataLength={data.length}
						valueName="rfidTag"
						title="RFID">Filtrovat podle RFID</DataTableTextFilter
					>
				</ShowToAdminsManagersAndEmployees>
			{/if}
			<DataTableResetFilter {pluginStates} on:filterReset={resetFilterVariables} />
		</div>
		<div class="flex items-center gap-2">
			<DataTableDatePicker
				{pluginStates}
				dataLength={data.length}
				bind:value={datePickerValue}
				bind:startValue={datePickerStartValue}
			/>
			<DataTableExportCsv
				{pluginStates}
				dataLength={data.length}
				bind:hiddenColumnsIds={$hiddenColumnIds}
			/>
			{#if showControls}
				<ShowToAdminsAndManagers {user} {userInCompany}>
					<DataTableImportCsv on:imported={invalidateAll} />
				</ShowToAdminsAndManagers>
			{/if}
		</div>
	</div>

	{#if data.length === 0}
		<TableSkeleton />
	{:else}
		<div>
			<Table.Root {...$tableAttrs}>
				<Table.Header {...$tableHeadAttrs}>
					{#each $headerRows as headerRow (headerRow.id)}
						<Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
							<Table.Row class="hover:bg-transparent" {...rowAttrs}>
								{#each headerRow.cells as cell (cell.id)}
									<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
										<Table.Head
											{...attrs}
											class="group inline-flex items-center gap-1 h-auto mb-2 p-2 bg-slate-100 dark:bg-slate-800 first:border-l last:border-r border-y
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
	{/if}
</div>
