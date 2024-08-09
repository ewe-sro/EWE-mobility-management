<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	import { CirclePlus, CircleX } from 'lucide-svelte';

	import { cn } from '$lib/utils';

	export let pluginStates;
	export let valueName: string;
	export let preview: string;
	export let builders: [any] | undefined = undefined;

	const { filterValues } = pluginStates.colFilter; // column filter
</script>

<Button
	variant="outline"
	{builders}
	class={cn(
		'flex items-center gap-1.5 h-7 py-1 px-1.5 text-muted-foreground hover:text-black dark:hover:text-white border-dashed rounded-full',
		$filterValues[valueName] !== undefined && 'border-solid'
	)}
>
	{#if $filterValues[valueName]}
		<Button
			on:click={(event) => {
				event.stopPropagation();
				$filterValues[valueName] = undefined;
			}}
			class="h-auto p-0 transition-none hover:text-destructive"
			variant="ghost"
		>
			<CircleX size="14" />
		</Button>
	{:else}
		<CirclePlus size="14" />
	{/if}
	<span><slot /></span>
	{#if $filterValues[valueName]}
		<Separator orientation="vertical" />
		<span class="text-xs text-primary leading-none">{preview}</span>
	{/if}
</Button>
