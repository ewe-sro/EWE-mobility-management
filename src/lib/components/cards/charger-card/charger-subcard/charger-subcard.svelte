<script lang="ts">
	let className: string | undefined = undefined;
	export { className as class };
</script>

<div
	class="flex justify-between items-center gap-4 py-2 px-4 bg-muted leading-none border rounded-lg {className}"
>
	<p class="text-sm text-muted-foreground font-medium"><slot name="valueName" /></p>
	<p class="text-lg text-black font-bold"><slot name="value" /></p>
</div>
