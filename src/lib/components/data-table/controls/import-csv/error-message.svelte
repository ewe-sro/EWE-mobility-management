<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';

	import { X } from 'lucide-svelte';

	export let error: {
		message: string;
	} | null;
</script>

{#if error}
	<Alert.Root class="relative !p-3 !pr-12 bg-black">
		<div class="flex items-center gap-3">
			<div class="p-1 rounded-full bg-red-300">
				<X size="14" strokeWidth="3" class="text-red-800" />
			</div>
			<Alert.Description class="text-white font-medium">{error.message}</Alert.Description>
		</div>

		<button class="absolute top-1/2 -translate-y-1/2 right-2" on:click={() => (error = null)}>
			<X class="text-slate-400 hover:text-white" size="16" />
		</button>
	</Alert.Root>
{/if}
