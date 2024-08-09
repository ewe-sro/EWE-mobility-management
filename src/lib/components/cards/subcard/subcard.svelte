<script lang="ts">
	let className: string | undefined = undefined;
	export { className as class };
</script>

<div class="py-2 px-4 bg-muted border rounded-lg {className}">
	<slot />
</div>
