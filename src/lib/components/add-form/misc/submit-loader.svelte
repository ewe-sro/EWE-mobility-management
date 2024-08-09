<script lang="ts">
	import { Loader2 } from 'lucide-svelte';

	export let delayed;
	export let iconSize: number = 24;
</script>

{#if delayed}
	<Loader2 size={iconSize} class="animate-spin-slow" />
{:else}
	<slot />
{/if}
