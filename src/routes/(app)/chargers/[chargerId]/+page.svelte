<script lang="ts">
	import { page } from '$app/stores';

	import * as Form from '$lib/components/ui/form';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Input } from '$lib/components/ui/input';

	import { TriangleAlert } from 'lucide-svelte';

	import { superForm } from 'sveltekit-superforms';

	import { emptyStringOnNull, getChargerStatus } from '$lib/utils';

	import Buttons from '$lib/components/editable-data/buttons/buttons.svelte';
	import DataContainer from '$lib/components/editable-data/data-container.svelte';
	import DataLabel from '$lib/components/editable-data/data-label.svelte';
	import DataPlaceholder from '$lib/components/editable-data/data-placeholder.svelte';
	import InputContainer from '$lib/components/editable-data/input-container.svelte';
	import InputErrorContainer from '$lib/components/editable-data/input-error-container.svelte';

	import ControllerCard from '$lib/components/cards/controller-card/controller-card.svelte';
	import LastConnectedHoverCard from '$lib/components/last-connected-hover-card/last-connected-hover-card.svelte';
	import ChargerStatus from '$lib/components/charging-status/charger-status.svelte';
	import CompanyCombobox from '$lib/components/add-form/misc/company-combobox.svelte';
	import ApiKeyButton from '$lib/components/buttons/api-key-button.svelte';
	import ShowHideButton from '$lib/components/buttons/show-hide-button.svelte';

	import ShowToAdmins from '$lib/components/role-container/show-to-admins.svelte';
	import DataTableSession from '$lib/components/data-table/data-table-session.svelte';

	export let data;

	const form = superForm(data.form);
	const { form: formData, message, errors, enhance } = form;

	// Used for tracking state of dialog
	let editChargerForm = false;
	let showApiKey = false;
	let companyComboboxOpen = false;

	// Get the charger status
	let status = getChargerStatus(data.charger.charger.lastConnected);

	const toggleForm = () => {
		editChargerForm = !editChargerForm;

		// Set the data to the updated/original value
		$formData.name = data.charger.charger.name;
		$formData.description = data.charger.charger.description;
		$formData.companyId = data.charger.charger.companyId;
	};

	let actionParam = $page.url.searchParams.get('action');
	$: if (actionParam === 'edit') {
		editChargerForm = true;
	}
</script>

<svelte:head>
	<title>Nabíjecí stanice – ID: {data.charger.charger.id} – EMM</title>
</svelte:head>

<Breadcrumb.Root class="p-4">
	<Breadcrumb.List>
		<Breadcrumb.Item>
			<Breadcrumb.Link href="/dashboard">Domů</Breadcrumb.Link>
		</Breadcrumb.Item>
		<Breadcrumb.Separator />
		<Breadcrumb.Item>
			<Breadcrumb.Link href="/chargers">Nabíjecí stanice</Breadcrumb.Link>
		</Breadcrumb.Item>
		<Breadcrumb.Separator />
		<Breadcrumb.Item>
			<Breadcrumb.Page>{data.charger.charger.name}</Breadcrumb.Page>
		</Breadcrumb.Item>
	</Breadcrumb.List>
</Breadcrumb.Root>

<section class="py-16 ~px-4/8 flex flex-col gap-20">
	<div class="max-w-5xl m-auto flex flex-col gap-4 w-full">
		<div class="flex flex-col items-start gap-1">
			<h1 class="text-3xl font-bold">{data.charger.charger.name}</h1>
			<LastConnectedHoverCard lastConnected={data.charger.charger.lastConnected}>
				<ChargerStatus
					lastConnected={data.charger.charger.lastConnected}
					class="bg-white dark:bg-slate-950"
				/>
			</LastConnectedHoverCard>
		</div>

		<div class="flex flex-col gap-20">
			{#if data.chargingControllers.length > 0}
				<div class="flex flex-col gap-4">
					<h2 class="text-xl font-semibold">Nabíjecí body</h2>

					<div class="grid grid-cols-3 gap-4 items-start">
						{#each data.chargingControllers as controller}
							<ControllerCard data={controller} {status} />
						{/each}
					</div>
				</div>
			{/if}

			<Card.Root id="information" class="flex flex-col gap-8 *:w-full p-8">
				<Card.Header class="p-0">
					<div class="flex justify-between items-center">
						<Card.Title tag="h2" class="text-xl font-semibold">Údaje nabíjecí stanice</Card.Title>
						<ShowToAdmins user={data.user}>
							<Buttons bind:edit={editChargerForm} formId="chargerForm" {toggleForm} />
						</ShowToAdmins>
					</div>
					<Separator />
				</Card.Header>

				<Card.Content class="p-0">
					<form
						class="flex flex-col gap-4"
						method="POST"
						action="?/chargerForm"
						use:enhance
						on:submit={toggleForm}
						id="chargerForm"
					>
						<!-- NÁZEV NABÍJECÍ STANICE -->
						<DataContainer>
							<DataLabel forInput="name">Název nabíjecí stanice</DataLabel>
							<InputContainer>
								<Form.Field {form} name="name">
									{#if !editChargerForm}
										<DataPlaceholder>
											{data.charger.charger.name}
										</DataPlaceholder>
									{:else}
										<Form.Control let:attrs>
											<Input
												{...attrs}
												bind:value={$formData.name}
												id="name"
												type="text"
												class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
											/>
										</Form.Control>
									{/if}
									{#if $errors.name}
										<InputErrorContainer>
											<Form.FieldErrors />
										</InputErrorContainer>
									{/if}
								</Form.Field>
							</InputContainer>
						</DataContainer>

						<!-- POPIS -->
						<DataContainer>
							<DataLabel forInput="description">Popis</DataLabel>
							<InputContainer>
								<Form.Field {form} name="description">
									{#if !editChargerForm}
										<DataPlaceholder>
											{emptyStringOnNull(data.charger.charger.description)}
										</DataPlaceholder>
									{:else}
										<Form.Control let:attrs>
											<Input
												{...attrs}
												bind:value={$formData.description}
												id="description"
												type="text"
												class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
											/>
										</Form.Control>
									{/if}
									{#if $errors.description}
										<InputErrorContainer>
											<Form.FieldErrors />
										</InputErrorContainer>
									{/if}
								</Form.Field>
							</InputContainer>
						</DataContainer>

						<!-- SPOLEČNOST -->
						<DataContainer>
							<DataLabel forInput="companyId">Společnost</DataLabel>
							<InputContainer>
								<Form.Field {form} name="companyId">
									{#if !editChargerForm}
										<DataPlaceholder>
											{emptyStringOnNull(data.charger.company?.name)}
										</DataPlaceholder>
									{:else}
										<CompanyCombobox
											{form}
											bind:formData={$formData}
											companies={data.companies}
											bind:comboboxOpen={companyComboboxOpen}
											label={false}
											align="left"
											class="max-w-xs"
										/>
									{/if}
									{#if $errors.companyId}
										<InputErrorContainer>
											<Form.FieldErrors />
										</InputErrorContainer>
									{/if}
								</Form.Field>
							</InputContainer>
						</DataContainer>

						<ShowToAdmins user={data.user}>
							<!-- API KLÍČ -->
							<DataContainer>
								<DataLabel>API klíč</DataLabel>
								<InputContainer>
									<DataPlaceholder>
										{#if showApiKey}
											{emptyStringOnNull(data.charger.charger.apiKey)}
										{:else if data.charger.charger.apiKey}
											<span class="select-none">••••••••••••••••••••</span>
										{/if}

										<div class="absolute top-1/2 right-1 -translate-y-1/2 flex gap-1">
											<ApiKeyButton />
											{#if data.charger.charger.apiKey}
												<ShowHideButton bind:show={showApiKey}>
													{#if !showApiKey}
														Zobrazit API klíč
													{:else}
														Skrýt API klíč
													{/if}
												</ShowHideButton>
											{/if}
										</div>
									</DataPlaceholder>
								</InputContainer>
							</DataContainer>
						</ShowToAdmins>

						{#if $message}
							<span class="inline-flex items-center gap-1.5 text-sm text-destructive font-medium">
								<TriangleAlert size="16" />
								{$message}
							</span>
						{/if}
					</form>
				</Card.Content>
			</Card.Root>
		</div>
	</div>

	<Card.Root id="charging-data" class="flex flex-col gap-4 *:w-full p-8">
		<Card.Header class="p-0">
			<Card.Title tag="h2" class="text-xl font-semibold">Nabíjecí relace</Card.Title>
			<Separator />
		</Card.Header>

		<DataTableSession
			data={data.chargingSessions}
			showController={true}
			user={data.user}
			userInCompany={data.userInCompany}
		/>
	</Card.Root>
</section>
