<script lang="ts">
	import * as Popover from '$lib/components/ui/popover';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';

	import FilterButton from './filter-button.svelte';

	import { CircleCheck } from 'lucide-svelte';

	export let pluginStates;

	const { filterValues } = pluginStates.colFilter; // column filter

	let selectedValue: any = {
		value: 'online',
		label: 'nabíjení dokončeno',
		disabled: false
	};
</script>

<Popover.Root>
	<Popover.Trigger asChild let:builder>
		<FilterButton
			builders={[builder]}
			{pluginStates}
			valueName="state"
			preview={selectedValue.label}>Stav</FilterButton
		>
	</Popover.Trigger>
	<Popover.Content align="start" class="flex flex-col gap-4 w-full max-w-[15rem] py-2 px-3 mt-1">
		<span class="text-sm font-medium">Filtrovat podle stavu</span>
		<Select.Root bind:selected={selectedValue}>
			<Select.Trigger
				class="relative justify-end h-auto px-2 py-1.5 focus:ring-2 focus:ring-offset-0 focus:ring-primary/30 focus:border-primary/70"
			>
				<Select.Value
					class="px-2 text-left text-accent-foreground font-medium first:absolute first:left-1/2 first:-translate-x-1/2 first:w-full"
				/>
			</Select.Trigger>
			<Select.Content>
				<Select.Group
					class="*:justify-between *:py-1.5 *:px-2 *:text-accent-foreground *:font-medium"
				>
					<Select.Item
						value="online"
						label="nabíjení dokončeno"
						class="group/select-option *:hidden"
					>
						nabíjení dokončeno
						<CircleCheck size="14" class="hidden group-aria-selected/select-option:block" />
					</Select.Item>
					<Select.Item
						value="charging"
						label="probíhá nabíjení"
						class="group/select-option *:hidden"
					>
						probíhá nabíjení
						<CircleCheck size="14" class="hidden group-aria-selected/select-option:block" />
					</Select.Item>
				</Select.Group>
			</Select.Content>
			<Select.Input name="state" />
		</Select.Root>
		<Button
			on:click={() => ($filterValues['state'] = selectedValue.value)}
			class="h-auto w-full px-2 py-1.5 bg-primary text-sm text-white font-medium rounded-md hover:bg-primary/90
            active:ring-2 active:ring-offset-0 active:ring-primary/30 active:border-primary/70"
			>Aplikovat</Button
		>
	</Popover.Content>
</Popover.Root>
