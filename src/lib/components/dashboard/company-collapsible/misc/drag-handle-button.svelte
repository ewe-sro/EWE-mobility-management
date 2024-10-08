<script lang="ts">
	import { dragHandle } from 'svelte-dnd-action';

	import { buttonVariants } from '$lib/components/ui/button';

	import { GripVertical } from 'lucide-svelte';

	import { cn } from '$lib/utils';

	let className: string | undefined = undefined;
	export { className as class };
</script>

<div
	use:dragHandle
	class={cn(buttonVariants({ variant: 'ghost' }), 'h-8 w-8 p-1 text-muted-foreground', className)}
>
	<GripVertical size={16} />
	<span class="sr-only">Přesunout</span>
</div>
