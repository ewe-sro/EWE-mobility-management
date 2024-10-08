<script lang="ts">
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';

	import * as Alert from '$lib/components/ui/alert';

	import { Check, X } from 'lucide-svelte';

	import { getFlash } from 'sveltekit-flash-message';

	import { cn } from '$lib/utils';

	const flash = getFlash(page, { clearAfterMs: 5000 });
</script>

{#if $flash}
	<div
		transition:fly={{ y: 100 }}
		class="fixed bottom-4 right-4 z-[9999]
	before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full"
	>
		<Alert.Root class="min-w-80 !p-3 !pr-12 bg-black">
			<div class="flex items-center gap-3">
				<div
					class={cn(
						'p-1 rounded-full',
						$flash.type === 'success' && 'bg-green-200',
						$flash.type === 'error' && 'bg-red-300'
					)}
				>
					{#if $flash.type == 'success'}
						<Check size="14" strokeWidth="3" class="text-green-800" />
					{:else}
						<X size="14" strokeWidth="3" class="text-red-800" />
					{/if}
				</div>
				<Alert.Description class="text-white font-medium">{$flash.message}</Alert.Description>
			</div>

			<button class="absolute top-2 right-2" on:click={() => ($flash = undefined)}>
				<X class="text-slate-400 hover:text-white" size="16" />
			</button>
		</Alert.Root>
	</div>
{/if}
