<script lang="ts">
	let className = '';

	export { className as class };
</script>

<div class="flex flex-col gap-1 w-full max-w-xs {className}">
	<slot />
</div>
