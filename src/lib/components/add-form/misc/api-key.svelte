<script lang="ts">
	import * as HoverCard from '$lib/components/ui/hover-card';
	import { Button } from '$lib/components/ui/button';

	import { Copy } from 'lucide-svelte';

	export let apiKey;

	// copy message
	let copied: boolean = false;

	const copyToClipBoard = () => {
		navigator.clipboard.writeText(apiKey);

		return new Promise<void>((resolve) => {
			copied = true;

			setTimeout(() => {
				copied = false;
				resolve();
			}, 5000);
		});
	};
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col items-center gap-1">
		<span class="text-sm text-muted-foreground font-medium">API klíč</span>

		<div class="bg-muted border rounded-md overflow-hidden">
			<div class="flex">
				<span class="py-2 px-4 text-lg font-semibold">{apiKey}</span>
				<HoverCard.Root openDelay={0} closeDelay={0} onOpenChange={() => (copied = false)}>
					<HoverCard.Trigger class="self-stretch">
						<Button
							on:click={copyToClipBoard}
							class="flex items-center gap-2 !h-full text-muted-foreground rounded-none border-0 border-l"
							variant="outline"
						>
							<Copy size="16" />
							<span>Kopírovat</span>
						</Button>
					</HoverCard.Trigger>
					<HoverCard.Content>
						{#if !copied}
							Zkopírovat do schránky
						{:else}
							Zkopírováno
						{/if}
					</HoverCard.Content>
				</HoverCard.Root>
			</div>
		</div>
	</div>
	<p class="text-center text-sm text-muted-foreground">
		<slot />
	</p>
</div>
