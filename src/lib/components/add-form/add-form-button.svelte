<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';

	import { Plus } from 'lucide-svelte';

	export let dialogOpen;
</script>

<Dialog.Trigger
	on:click={() => (dialogOpen = true)}
	class="flex items-center gap-1.5 h-auto px-2 py-1.5 bg-primary text-sm text-white font-medium rounded-md whitespace-nowrap
	hover:bg-primary/90 active:ring-2 active:ring-offset-0 active:ring-primary/30 active:border-primary/70"
>
	<Plus size="16" />
	<slot />
	<span class="flex justify-center items-center h-4 w-4 bg-primary-600 leading-none rounded">n</span
	>
</Dialog.Trigger>
