<script lang="ts">
	import { writable } from 'svelte/store';

	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import {
		addGridLayout,
		addSortBy,
		addHiddenColumns,
		addColumnFilters
	} from 'svelte-headless-table/plugins';

	import * as Table from '$lib/components/ui/table';

	import RoleBadge from '$lib/components/role-badge/role-badge.svelte';
	import DataTableActions from './data-table-actions-users.svelte';
	import DataTableSort from '$lib/components/data-table/controls/data-table-sort.svelte';
	import DataTableTextFilter from '$lib/components/data-table/column-filters/text-filter.svelte';
	import DataTableResetFilter from '$lib/components/data-table/controls/data-table-reset-filter.svelte';

	import { textFilter } from '$lib/components/data-table/column-filters/filters';

	type UserData = {
		user: {
			email: string;
			role: string;
			password: string;
			id: string;
			createdAt: Date;
		};
		profile: {
			firstName: string | null;
			lastName: string | null;
			id: number;
			userId: string;
		} | null;
	}[];

	export let data: UserData;
	export let loggedUser;

	const tableData = writable(data);
	const table = createTable(tableData, {
		grid: addGridLayout(),
		sort: addSortBy({
			initialSortKeys: [
				{
					id: 'email',
					order: 'asc'
				}
			],
			disableMultiSort: true,
			toggleOrder: ['asc', 'desc']
		}),
		hide: addHiddenColumns(),
		colFilter: addColumnFilters()
	});

	// to handle delete actions - delete row from UI
	const handleUserDelete = (event: any) => {
		const deletedId = event.detail;

		$tableData = $tableData.filter((record: any) => record.user.id !== deletedId);
	};

	const columns = table.createColumns([
		table.column({
			accessor: (item) => item.user.id,
			id: 'id',
			header: 'ID',
			plugins: {
				sort: {
					disable: false
				}
			}
		}),
		table.column({
			accessor: (item) => item.user.email,
			id: 'email',
			header: 'Email',
			plugins: {
				sort: {
					disable: false
				},
				colFilter: {
					fn: textFilter
				}
			}
		}),
		table.column({
			accessor: (item) => item.profile?.firstName,
			id: 'firstName',
			header: 'Jméno',
			plugins: {
				sort: {
					disable: false
				}
			}
		}),
		table.column({
			accessor: (item) => item.profile?.lastName,
			id: 'lastName',
			header: 'Příjmení',
			plugins: {
				sort: {
					disable: false
				}
			}
		}),
		table.column({
			accessor: (item) => item.user.role,
			id: 'role',
			header: 'Role',
			cell: ({ value }) => {
				return createRender(RoleBadge, { role: value });
			},
			plugins: {
				sort: {
					disable: true
				}
			}
		}),
		table.column({
			accessor: (item: any) => item.user.id,
			id: 'actions',
			header: '',
			cell: ({ value }) => {
				return createRender(DataTableActions, { id: value, loggedUser: loggedUser }).on(
					'userDeleted',
					handleUserDelete
				);
			},
			plugins: {
				sort: {
					disable: true
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
	const { filterValues } = pluginStates.colFilter; // column filter

	// Hidden columns by default
	const hiddenColumns = ['id'];

	const ids = flatColumns.map((col) => col.id);
	let hideForId = Object.fromEntries(ids.map((id) => [id, !hiddenColumns.includes(id)]));

	$: $hiddenColumnIds = Object.entries(hideForId)
		.filter(([, hide]) => !hide)
		.map(([id]) => id);

	const resetFilterVariables = () => {
		$filterValues = {};
	};
</script>

<div class="flex flex-col items-start gap-4 w-full overflow-x-auto">
	<div class="flex items-center gap-2">
		<DataTableTextFilter {pluginStates} dataLength={data.length} valueName="email" title="Email"
			>Filtrovat podle email</DataTableTextFilter
		>
		<DataTableResetFilter {pluginStates} on:filterReset={resetFilterVariables} />
	</div>

	<Table.Root {...$tableAttrs}>
		<Table.Header {...$tableHeadAttrs}>
			{#each $headerRows as headerRow (headerRow.id)}
				<Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
					<Table.Row class="hover:bg-transparent" {...rowAttrs}>
						{#each headerRow.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
								<Table.Head
									{...attrs}
									class="group inline-flex items-center gap-1 h-auto mb-2 px-2 py-2 bg-slate-100 dark:bg-slate-800 first:border-l last:border-r border-y
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
					<Table.Row {...rowAttrs} class="*:hover:bg-muted/75">
						{#each row.cells as cell (cell.id)}
							{@const currentRow = $originalRows[Number(row.id)]}
							<Subscribe attrs={cell.attrs()} let:attrs>
								<Table.Cell
									{...attrs}
									class="flex w-full p-0 border-b first:rounded-l-md last:rounded-r-md
									*:h-full *:w-full *:px-4 *:py-1.5 *:inline-flex *:items-center whitespace-nowrap"
								>
									{#if cell.id === 'actions'}
										<span class="justify-end">
											<Render of={cell.render()} />
										</span>
									{:else if cell.render() !== 'null' && cell.render() !== 'undefined'}
										<a href="/profile/{currentRow.cells[0].render()}">
											<Render of={cell.render()} />
										</a>
									{:else}
										<a href="/profile/{currentRow.cells[0].render()}"> </a>
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
