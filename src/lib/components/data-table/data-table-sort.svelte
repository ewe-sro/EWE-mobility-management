<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';

	import { ChevronsUpDown, ChevronUp, ChevronDown, ArrowUp, ArrowDown } from 'lucide-svelte';

	export let pluginStates;
	export let cellId;

	const { sortKeys } = pluginStates.sort;

	const sort = (id: string, order: 'asc' | 'desc') => {
		$sortKeys = [
			{
				id: id,
				order: order
			}
		];
	};
</script>

<DropdownMenu.Root preventScroll={false}>
	<DropdownMenu.Trigger asChild let:builder>
		<div class="group" class:active={$sortKeys[0].id === cellId}>
			<Button
				variant="ghost"
				builders={[builder]}
				class="flex items-center gap-1 h-auto py-1 px-2 hover:bg-slate-200
		data-[state=open]:bg-muted"
			>
				<slot />
				{#if $sortKeys[0].id === cellId}
					{#if $sortKeys[0].order === 'asc'}
						<ChevronUp size="14" class="text-black" />
					{:else}
						<ChevronDown size="14" class="text-black" />
					{/if}
				{:else}
					<ChevronsUpDown size="14" />
				{/if}
			</Button>
		</div>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
		align="start"
		class="space-y-1 *:flex *:items-center *:gap-2 *:pr-4 *:text-muted-foreground *:font-medium"
	>
		<DropdownMenu.Item on:click={() => sort(cellId, 'asc')}>
			<ArrowUp size="14" />
			<span>Seřadit vzestupně</span>
		</DropdownMenu.Item>
		<DropdownMenu.Item on:click={() => sort(cellId, 'desc')}>
			<ArrowDown size="14" />
			<span>Seřadit sestupně</span>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
