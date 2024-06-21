<script lang="ts">
	let className = '';

	export { className as class };
</script>

<span
	class="flex items-center h-10 py-2 px-3 text-sm text-muted-foreground border border-transparent {className}"
>
	<slot />
</span>
