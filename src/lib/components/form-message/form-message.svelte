<script lang="ts">
	import { TriangleAlert } from 'lucide-svelte';

	export let message;
</script>

{#if message}
	<div
		class="flex items-center gap-2 text-sm text-red-500 dark:text-white font-medium py-2 px-3 bg-red-100 dark:bg-red-500 rounded-md"
	>
		<TriangleAlert size="16" />
		<span>{message}</span>
	</div>
{/if}
