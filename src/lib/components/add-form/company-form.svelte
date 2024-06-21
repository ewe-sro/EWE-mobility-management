<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	import { TriangleAlert, Trash2 } from 'lucide-svelte';

	import AddFormButton from './add-form-button.svelte';

	import { superForm } from 'sveltekit-superforms';
	import SuperDebug from 'sveltekit-superforms';

	export let data: any;
	export let dialogOpen: boolean;

	const form = superForm(data.form);
	const { form: formData, message, enhance } = form;

	// Used for resetting the logo file upload after submit/dialog close
	const resetLogoUpload = () => {
		uploadedImage = undefined;
		$formData.logo = undefined;
	};

	// Used for closing the dialog
	const closeDialog = () => {
		resetLogoUpload();

		dialogOpen = false;
	};

	async function loadAres() {
		const requestUrl = `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${$formData.ic}`;
		const response = await fetch(requestUrl);

		if (response.status == 200) {
			const companyData = await response.json();

			$formData.name = companyData['obchodniJmeno'];
			$formData.street = `${companyData['sidlo']['nazevUlice']} ${companyData['sidlo']['cisloDomovni']}`;
			$formData.city = companyData['sidlo']['nazevObce'];
			$formData.zip = `${companyData['sidlo']['psc']}`;

			// Check if DIC was returned
			if (companyData['dic']) {
				$formData.dic = companyData['dic'];
			}
		}
	}

	let uploadedImage: string | undefined;

	function handleImageUpload(e: Event) {
		const image = (e.target as HTMLInputElement)?.files?.[0];

		if (!image) return;

		// Return the object for the preview image source
		uploadedImage = URL.createObjectURL(image);
	}
</script>

<Dialog.Root bind:open={dialogOpen}>
	<AddFormButton bind:dialogOpen>Přidat společnost</AddFormButton>
	<Dialog.Content class="gap-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
		<!-- <SuperDebug data={$formData} /> -->

		<Dialog.Header>
			<Dialog.Title>Vytvořit společnost</Dialog.Title>
			<Separator />
		</Dialog.Header>

		<form
			id="addChargerForm"
			class="flex flex-col gap-6"
			method="POST"
			enctype="multipart/form-data"
			use:enhance
		>
			<!-- NAME -->
			<Form.Field {form} name="name">
				<Form.Control let:attrs>
					<Form.Label>Název společnosti</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData.name}
						type="text"
						autocomplete="off"
						class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- IČO -->
			<Form.Field {form} name="ic">
				<Form.Control let:attrs>
					<div class="flex justify-between items-center">
						<Form.Label>IČO</Form.Label>
						<Button on:click={loadAres} variant="link" class="h-auto p-0"
							>Načíst data z rejstříku ARES</Button
						>
					</div>
					<Input
						{...attrs}
						bind:value={$formData.ic}
						type="text"
						class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- DIČ -->
			<Form.Field {form} name="dic">
				<Form.Control let:attrs>
					<Form.Label>DIČ</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData.dic}
						type="text"
						class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- ZIP -->
			<Form.Field {form} name="zip">
				<Form.Control let:attrs>
					<Form.Label>PSČ</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData.zip}
						type="text"
						autocomplete="adress-line2"
						class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- CITY -->
			<Form.Field {form} name="street">
				<Form.Control let:attrs>
					<Form.Label>Ulice</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData.street}
						type="text"
						autocomplete="adress-line2"
						class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- CITY -->
			<Form.Field {form} name="city">
				<Form.Control let:attrs>
					<Form.Label>Město</Form.Label>
					<Input
						{...attrs}
						bind:value={$formData.city}
						type="text"
						autocomplete="adress-line2"
						class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!--
			<Form.Field {form} name="logo">
				<Form.Control let:attrs>
					<Form.Label>Logo</Form.Label>
					<div class="flex gap-2">
						<Input
							{...attrs}
							bind:value={$formData.logo}
							on:change={handleImageUpload}
							type="file"
							accept="image/*"
							class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
						/>
						<Button
							on:click={resetLogoUpload}
							variant="outline"
							class="h-10 aspect-square p-1.5 text-muted-foreground hover:text-black"
						>
							<Trash2 size="18" />
						</Button>
					</div>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field> -->

			{#if uploadedImage}
				<img src={uploadedImage} style="max-width: 50ch;" alt={$formData.name} />
			{/if}

			{#if $message}
				<span class="inline-flex items-center gap-1 text-sm text-destructive font-medium">
					<TriangleAlert size="16" />
					{$message}
				</span>
			{/if}
		</form>

		<div>
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
				<Button
					type="submit"
					form="addChargerForm"
					class="flex items-center gap-1.5 h-auto px-2 py-1.5 bg-primary text-sm text-white font-medium rounded-md hover:bg-primary/90
            active:ring-2 active:ring-offset-0 active:ring-primary/30 active:border-primary/70
            focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					>Pokračovat</Button
				>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
