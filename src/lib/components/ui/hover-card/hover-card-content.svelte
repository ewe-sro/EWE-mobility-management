<script lang="ts">
	import { LinkPreview as HoverCardPrimitive } from 'bits-ui';
	import { cn, flyAndScale } from '$lib/utils.js';

	type $$Props = HoverCardPrimitive.ContentProps;

	let className: $$Props['class'] = undefined;
	export let transition: $$Props['transition'] = flyAndScale;
	export let transitionConfig: $$Props['transitionConfig'] = undefined;
	export let align: $$Props['align'] = 'center';
	export let sideOffset: $$Props['sideOffset'] = 4;
	export { className as class };
</script>

<HoverCardPrimitive.Content
	{transition}
	{transitionConfig}
	{align}
	{sideOffset}
	class={cn(
		'z-50 mt-3 rounded-md shadow-md outline-none relative w-auto p-2 bg-black text-xs text-white border-0 before:absolute before:top-0 before:left-1/2 before:-translate-y-1/2 before:-translate-x-1/2 before:h-2 before:w-2 before:bg-black before:-rotate-45',
		className
	)}
	{...$$restProps}
>
	<slot />
</HoverCardPrimitive.Content>
