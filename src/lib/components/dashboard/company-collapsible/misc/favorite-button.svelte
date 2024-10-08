<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	import { Button } from '$lib/components/ui/button';
	import * as HoverCard from '$lib/components/ui/hover-card';

	import { Star } from 'lucide-svelte';

	import { cn } from '$lib/utils';

	export let company;

	let className: string | undefined = undefined;
	export { className as class };

	const follow = async (event: Event, companyId: number) => {
		event.stopPropagation();

		await fetch(`/api/company/${companyId}/follow`, {
			method: 'POST'
		});

		// Invalidate load data to show the changed data
		invalidateAll();
	};
</script>

<HoverCard.Root openDelay={0} closeDelay={0}>
	<HoverCard.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			on:click={(event) => follow(event, company.company.id)}
			variant="ghost"
			size="sm"
			class={cn(
				'h-8 w-8 p-1 text-muted-foreground transition-colors duration-300',
				company.isFollowed && 'text-yellow-600 hover:text-yellow-600',
				className
			)}
		>
			<Star size={16} />
			<span class="sr-only">Přidat do oblíbených</span>
		</Button>
	</HoverCard.Trigger>
	<HoverCard.Content>
		{#if !company.isFollowed}
			Přidat do oblíbených
		{:else}
			Přidáno do oblíbených
		{/if}
	</HoverCard.Content>
</HoverCard.Root>
