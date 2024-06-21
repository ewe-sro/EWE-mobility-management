<script lang="ts">
	import * as Select from '$lib/components/ui/select';

	export let pluginStates;

	const { pageSize } = pluginStates.page; // pagination

	// for tracking the state of the pagination select
	let selectedPagination = {
		disabled: false,
		label: '10',
		value: 10
	};

	$: $pageSize = selectedPagination.value;
</script>

<div class="flex items-center gap-2">
	<span class="text-sm text-muted-foreground">Počet záznamů na stránce:</span>
	<Select.Root preventScroll={false} bind:selected={selectedPagination}>
		<Select.Trigger
			class="justify-around gap-0.5 w-16 py-1.5 px-2 shadow-sm focus:ring-0 focus:ring-offset-0"
		>
			<Select.Value class="text-muted-foreground font-medium" />
		</Select.Trigger>
		<Select.Content>
			<Select.Group class="*:py-1 *:px-2 *:justify-center">
				<Select.Item class="*:hidden" value={10} label="10" />
				<Select.Item class="*:hidden" value={20} label="20" />
				<Select.Item class="*:hidden" value={50} label="50" />
			</Select.Group>
		</Select.Content>
		<Select.Input name="selectedPagination" />
	</Select.Root>
</div>
