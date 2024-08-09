<script lang="ts">
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	import FilterButton from './filter-button.svelte';

	export let pluginStates;

	const { filterValues } = pluginStates.colFilter; // column filter

	let inputValue: string;
</script>

<Popover.Root>
	<Popover.Trigger asChild let:builder>
		<FilterButton builders={[builder]} {pluginStates} valueName="rfidTag" preview={inputValue}
			>RFID</FilterButton
		>
	</Popover.Trigger>
	<Popover.Content align="start" class="flex flex-col gap-4 w-full max-w-[15rem] py-2 px-3 mt-1">
		<span class="text-sm font-medium">Filtrovat podle RFID</span>
		<div class="flex items-center gap-2">
			<span class="text-sm text-accent-foreground whitespace-nowrap">obsahuje</span>
			<Input
				bind:value={inputValue}
				type="text"
				class="h-[1.875rem] px-2 py-1.5 text-sm text-accent-foreground leading-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
			/>
		</div>
		<Button
			on:click={() => ($filterValues['rfidTag'] = inputValue)}
			class="h-auto w-full px-2 py-1.5 bg-primary text-sm text-white font-medium rounded-md hover:bg-primary/90
            active:ring-2 active:ring-offset-0 active:ring-primary/30 active:border-primary/70"
			>Aplikovat</Button
		>
	</Popover.Content>
</Popover.Root>
