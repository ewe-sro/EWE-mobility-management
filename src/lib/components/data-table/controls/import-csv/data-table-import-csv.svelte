<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { page } from '$app/stores';

	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	import FileUpload from './file-upload.svelte';
	import DataPreview from './data-preview.svelte';
	import ErrorMessage from './error-message.svelte';

	import { Upload } from 'lucide-svelte';

	import { updateFlash } from 'sveltekit-flash-message';

	import { buttonVariants } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';

	let dialogOpen = false;

	let files: Blob[] = [];
	let tableData: string[][] = [];
	let apiData = {};

	let step: 'fileUpload' | 'dataPreview' = 'fileUpload';
	let error: {
		message: string;
	} | null;

	const dispatch = createEventDispatcher();

	// Function for resetting the import dialog
	const reset = () => {
		files = [];
		tableData = [];
		apiData = {};

		step = 'fileUpload';
		error = null;
	};

	const nextStep = async () => {
		if (step === 'fileUpload') {
			if (files.length > 0) {
				// If a CSV file was uploaded go to the next step
				step = 'dataPreview';
			} else {
				// If no CSV file was uploaded show an error
				error = {
					message: 'Nebyl nahrán žádný CSV soubor'
				};
			}
		} else if (step === 'dataPreview') {
			// Send the CSV data to an API endpoint
			await fetch(`/api/charger/${$page.params.chargerId}/import-csv-data`, {
				method: 'POST',
				body: JSON.stringify({ apiData }),
				headers: {
					'content-type': 'application/json'
				}
			});

			// Update the flash message that API endpoint sent
			await updateFlash(page);

			reset();

			// Dispatch for loading the imported data
			dispatch('imported');
		}
	};
</script>

<Dialog.Root bind:open={dialogOpen} onOpenChange={reset}>
	<Dialog.Trigger
		on:click={() => (dialogOpen = true)}
		class={cn(
			buttonVariants({ variant: 'outline' }),
			'flex items-center gap-1.5 h-auto px-2 py-1.5 text-sm shadow-sm'
		)}
	>
		<Upload size="16" />
		Importovat data
	</Dialog.Trigger>

	<Dialog.Content
		class={cn(
			'gap-8 overflow-y-auto max-h-[calc(100vh-4rem)]',
			step === 'dataPreview' && 'max-w-[90rem]'
		)}
	>
		<Dialog.Header>
			<Dialog.Title>Importovat nabíjecí relace</Dialog.Title>
			<Separator />
		</Dialog.Header>

		{#if step === 'fileUpload'}
			<FileUpload bind:files bind:tableData bind:apiData />
		{:else if step === 'dataPreview'}
			<DataPreview bind:tableData />
		{/if}

		<ErrorMessage bind:error />

		<Dialog.Footer class="!flex-col">
			<Separator class="mb-2" />
			<div class={cn('flex justify-end', step === 'dataPreview' && 'justify-between')}>
				{#if step === 'dataPreview'}
					<Button
						on:click={() => (step = 'fileUpload')}
						variant="ghost"
						class="justify-self-start h-auto px-2 py-1.5 text-sm
                	active:ring-2 active:ring-offset-0 active:ring-accent/30 active:border-accent/70
            		focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-accent/30 focus-visible:border-accent/70"
						>Zpět</Button
					>
				{/if}

				<div class="flex gap-1.5">
					<Button
						on:click={() => (dialogOpen = false)}
						variant="ghost"
						class="h-auto px-2 py-1.5 text-sm
                	active:ring-2 active:ring-offset-0 active:ring-accent/30 active:border-accent/70
            		focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-accent/30 focus-visible:border-accent/70"
						>Zrušit</Button
					>
					<Button
						on:click={nextStep}
						type="submit"
						form="importCsvDataForm"
						class="flex items-center gap-1.5 h-auto px-2 py-1.5 bg-primary text-sm text-white font-medium rounded-md hover:bg-primary/90
            		active:ring-2 active:ring-offset-0 active:ring-primary/30 active:border-primary/70
            		focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
						>Pokračovat</Button
					>
				</div>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
