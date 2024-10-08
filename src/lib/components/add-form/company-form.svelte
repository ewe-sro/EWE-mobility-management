<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	import AddFormButton from './add-form-button.svelte';
	import SubmitLoader from './misc/submit-loader.svelte';
	import FormMessage from '$lib/components/form-message/form-message.svelte';

	import { superForm } from 'sveltekit-superforms';

	export let formObj;
	export let dialogOpen: boolean;

	const form = superForm(formObj);
	const { form: formData, message, delayed, errors, enhance } = form;

	const loadAres = async () => {
		// Call ARES API to get company data from ICO
		const requestUrl = `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${$formData.ic}`;
		const response = await fetch(requestUrl);

		if (response.status === 200) {
			// STATUS 200: valid data => fill the form
			const companyData = await response.json();

			$formData.name = companyData['obchodniJmeno'];
			$formData.street = `${companyData['sidlo']['nazevUlice']} ${companyData['sidlo']['cisloDomovni']}`;
			$formData.city = companyData['sidlo']['nazevObce'];
			$formData.zip = `${companyData['sidlo']['psc']}`;

			// Check if DIC was returned, if so fill the DIC input
			if (companyData['dic']) {
				$formData.dic = companyData['dic'];
			}
		} else if (response.status === 400) {
			// STATUS 400: invalid input => error
			$errors.ic = ['Zadejte prosím platné IČO.'];
		} else {
			// OTHER ERRORS: error => error
			$errors.ic = ['Data ze serveru se nepodařilo získat.'];
		}
	};
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
			id="companyForm"
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

			<FormMessage message={$message} />
		</form>

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
				<Button
					type="submit"
					form="companyForm"
					class="flex items-center gap-1.5 h-auto px-2 py-1.5 bg-primary text-sm text-white font-medium rounded-md hover:bg-primary/90
            active:ring-2 active:ring-offset-0 active:ring-primary/30 active:border-primary/70
            focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
				>
					<SubmitLoader delayed={$delayed} iconSize={16}>Pokračovat</SubmitLoader>
				</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
