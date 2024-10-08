<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as HoverCard from '$lib/components/ui/hover-card';

	import { Link } from 'lucide-svelte';

	export let href: string | undefined = undefined;
	export let iconSize: number = 16;

	let className: string | undefined = undefined;
	export { className as class };
</script>

<HoverCard.Root openDelay={0} closeDelay={0}>
	<HoverCard.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			on:click={(event) => event.stopPropagation()}
			{href}
			variant="ghost"
			size="sm"
			class="h-8 w-8 p-1 text-muted-foreground {className}"
		>
			<Link size={iconSize} />
			<span class="sr-only">Zobrazit detail</span>
		</Button>
	</HoverCard.Trigger>
	<HoverCard.Content>
		<slot />
	</HoverCard.Content>
</HoverCard.Root>
