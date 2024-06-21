<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import { Progress } from '$lib/components/ui/progress';

	import { Check, X } from 'lucide-svelte';

	import { fly } from 'svelte/transition';

	import { getFlash } from 'sveltekit-flash-message';
	import { page } from '$app/stores';

	const flash = getFlash(page, { clearAfterMs: 5000 });
</script>

{#if $flash}
	<div
		transition:fly={{ y: 100 }}
		class="fixed bottom-4 right-4 z-[9999]
	before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full"
	>
		<Alert.Root class="!py-3 !px-4 !pr-12">
			<div class="flex items-start gap-4">
				{#if $flash.type == 'success'}
					<div class="p-1 bg-lime-600 rounded-full">
						<Check size="16" class="text-white" />
					</div>
					<div class="flex flex-col gap-1">
						<Alert.Title class="mb-0 text-lime-600 leading-normal">Úspěch</Alert.Title>
						<Alert.Description class="text-muted-foreground">{$flash.message}</Alert.Description>
					</div>
				{:else}
					<div class="p-1 bg-red-600 rounded-full">
						<X size="16" strokeWidth="3" class="text-white" />
					</div>
					<div class="flex flex-col gap-1">
						<Alert.Title class="mb-0 text-red-600 leading-normal">Chyba</Alert.Title>
						<Alert.Description class="text-muted-foreground">{$flash.message}</Alert.Description>
					</div>
				{/if}
			</div>

			<button class="absolute top-2 right-2" on:click={() => ($flash = undefined)}>
				<X class="text-muted-foreground hover:text-black" size="14" />
			</button>
		</Alert.Root>
	</div>
{/if}
