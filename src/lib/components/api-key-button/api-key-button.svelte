<script lang="ts">
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';

	import * as Dialog from '$lib/components/ui/dialog';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	import ApiKey from '../add-form/misc/api-key.svelte';

	import { KeyRound } from 'lucide-svelte';

	let dialogOpen = false;

	let apiKey: string | undefined;
	const generateApiKey = async (chargerId: string) => {
		// make an API request to generate a new API key
		const response = await fetch(`/api/charger/${chargerId}/generate-api-key`, {
			method: 'POST'
		});

		const data = await response.json();

		// set the apiKey to the API key generated from the API
		apiKey = data.apiKey;

		// invalidate the page to get the newly fetched API key
		invalidateAll();
	};
</script>

<Dialog.Root bind:open={dialogOpen} onOpenChange={() => (apiKey = undefined)}>
	<Dialog.Trigger>
		<HoverCard.Root openDelay={0} closeDelay={0}>
			<HoverCard.Trigger>
				<Button
					variant="ghost"
					class="h-auto p-1.5 !m-0 text-muted-foreground hover:text-black"
					on:click={() => (dialogOpen = true)}
				>
					<KeyRound size="16" />
				</Button>
			</HoverCard.Trigger>
			<HoverCard.Content>Vygenerovat nový API klíč</HoverCard.Content>
		</HoverCard.Root>
	</Dialog.Trigger>
	<Dialog.Content class="gap-8">
		<Dialog.Header>
			<Dialog.Title>Vygenerovat API klíč</Dialog.Title>
			<Separator />
		</Dialog.Header>

		{#if !apiKey}
			<div class="flex flex-col gap-4">
				<Button
					class="self-center flex items-center gap-2 h-11 text-muted-foreground"
					variant="outline"
					on:click={() => generateApiKey($page.params.chargerId)}
				>
					<KeyRound size="16" />
					<span>Vygenerovat API klíč</span>
				</Button>

				<p class="text-center text-sm text-muted-foreground">
					Po vygenerování nového API klíče bude nutné tento klíč vložit do konfiguračního souboru
					nabíjecí stanice pro její správné fungování.
				</p>
			</div>
		{:else}
			<ApiKey {apiKey}>
				Nový API klíč pro nabíjecí stanici byl úspěšně vygenerován. Pro dokončení nastavení vložte
				tento klíč do konfiguračního souboru nabíjecí stanice.
			</ApiKey>
		{/if}

		<Dialog.Footer class="!flex-col">
			<Separator class="mb-2" />
			<div class="flex justify-end gap-1.5">
				<Button
					on:click={() => (dialogOpen = false)}
					variant="ghost"
					class="h-auto px-2 py-1.5 text-sm
                active:ring-2 active:ring-offset-0 active:ring-accent/30 active:border-accent/70
            focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-accent/30 focus-visible:border-accent/70"
					>Zrušit</Button
				>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
