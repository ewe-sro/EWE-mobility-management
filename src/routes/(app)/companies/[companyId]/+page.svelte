<script lang="ts">
	import { page } from '$app/stores';
	import { tick } from 'svelte';

	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';

	import { superForm } from 'sveltekit-superforms';

	import Buttons from '$lib/components/editable-data/buttons/buttons.svelte';
	import DataContainer from '$lib/components/editable-data/data-container.svelte';
	import DataLabel from '$lib/components/editable-data/data-label.svelte';
	import DataPlaceholder from '$lib/components/editable-data/data-placeholder.svelte';
	import InputContainer from '$lib/components/editable-data/input-container.svelte';
	import InputErrorContainer from '$lib/components/editable-data/input-error-container.svelte';

	import TableSkeleton from '$lib/components/table-skeleton/table-skeleton.svelte';
	import DataTableEmployees from './data-table-employees.svelte';
	import DataTableChargers from './data-table-chargers.svelte';
	import DataTableSessions from './data-table-sessions.svelte';
	import DataTableRfid from './data-table-rfid.svelte';
	import CompanyDetailSubcard from '$lib/components/cards/company-card/company-subcard/company-detail-subcard.svelte';
	import ChargerForm from '$lib/components/add-form/charger-form.svelte';
	import EmployeeForm from '$lib/components/add-form/employee-form.svelte';
	import RfidForm from '$lib/components/add-form/rfid-form.svelte';

	import ShowToAdminsAndManagers from '$lib/components/role-container/show-to-admins-and-managers.svelte';
	import ShowToAdminsManagersAndEmployees from '$lib/components/role-container/show-to-admins-managers-and-employees.svelte';

	import { emptyStringOnNull, convertTokW } from '$lib/utils';

	export let data;

	const form = superForm(data.companyForm);
	const { form: formData, message, errors, enhance } = form;

	// Used for tracking state of dialog
	let employeeDialogOpen = false;
	let chargerDialogOpen = false;
	let otherRfidDialogOpen = false;

	let editCompanyForm = false;

	let comboboxOpen = false;

	const toggleForm = () => {
		editCompanyForm = !editCompanyForm;

		// Set the data to the updated/original value
		$formData.name = data.company.name;
		$formData.ic = data.company.ic;
		$formData.dic = data.company.dic;
		$formData.street = data.company.street;
		$formData.city = data.company.city;
		$formData.zip = data.company.zip;
	};

	let actionParam = $page.url.searchParams.get('action');
	$: if (actionParam === 'edit') {
		editCompanyForm = true;
	}
</script>

<svelte:head>
	<title>Společnosti – {data.company.name} – EMM</title>
</svelte:head>

<Breadcrumb.Root class="p-4">
	<Breadcrumb.List>
		<Breadcrumb.Item>
			<Breadcrumb.Link href="/dashboard">Domů</Breadcrumb.Link>
		</Breadcrumb.Item>
		<Breadcrumb.Separator />
		<Breadcrumb.Item>
			<Breadcrumb.Link href="/companies">Společnosti</Breadcrumb.Link>
		</Breadcrumb.Item>
		<Breadcrumb.Separator />
		<Breadcrumb.Item>
			<Breadcrumb.Page>{data.company.name}</Breadcrumb.Page>
		</Breadcrumb.Item>
	</Breadcrumb.List>
</Breadcrumb.Root>

<section class="py-16 ~px-4/8">
	<div class="max-w-5xl m-auto flex flex-col gap-4">
		<!-- HEADING + ADD BUTTON -->
		<h1 class="text-3xl font-bold">{data.company.name}</h1>

		<div class="flex flex-col gap-20">
			<Card.Root class="flex flex-col gap-8 *:w-full p-8">
				<Card.Header class="p-0">
					<div class="flex justify-between items-center">
						<Card.Title tag="h2" class="text-xl font-semibold">Údaje společnosti</Card.Title>
						<ShowToAdminsAndManagers user={data.user} userInCompany={data.userInCompany}>
							<Buttons bind:edit={editCompanyForm} formId="companyForm" {toggleForm} />
						</ShowToAdminsAndManagers>
					</div>
					<Separator />
				</Card.Header>

				<Card.Content class="p-0">
					<form
						class="flex flex-col gap-4"
						method="POST"
						action="?/companyForm"
						use:enhance
						on:submit={toggleForm}
						id="companyForm"
					>
						<!-- JMÉNO SPOLEČNOSTI -->
						<DataContainer>
							<DataLabel forInput="name">Název společnosti</DataLabel>
							<InputContainer>
								<Form.Field {form} name="name">
									{#if !editCompanyForm}
										<DataPlaceholder>
											{data.company.name}
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

						<!-- IČO -->
						<DataContainer>
							<DataLabel forInput="ic">IČO</DataLabel>
							<InputContainer>
								<Form.Field {form} name="ic">
									{#if !editCompanyForm}
										<DataPlaceholder>
											{emptyStringOnNull(data.company.ic)}
										</DataPlaceholder>
									{:else}
										<Form.Control let:attrs>
											<Input
												{...attrs}
												bind:value={$formData.ic}
												id="ic"
												type="text"
												class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
											/>
										</Form.Control>
									{/if}
									{#if $errors.ic}
										<InputErrorContainer>
											<Form.FieldErrors />
										</InputErrorContainer>
									{/if}
								</Form.Field>
							</InputContainer>
						</DataContainer>

						<!-- DIČ -->
						<DataContainer>
							<DataLabel forInput="dic">DIČ</DataLabel>
							<InputContainer>
								<Form.Field {form} name="dic">
									{#if !editCompanyForm}
										<DataPlaceholder>
											{emptyStringOnNull(data.company.dic)}
										</DataPlaceholder>
									{:else}
										<Form.Control let:attrs>
											<Input
												{...attrs}
												bind:value={$formData.dic}
												id="dic"
												type="text"
												class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
											/>
										</Form.Control>
									{/if}
									{#if $errors.dic}
										<InputErrorContainer>
											<Form.FieldErrors />
										</InputErrorContainer>
									{/if}
								</Form.Field>
							</InputContainer>
						</DataContainer>

						<!-- ULICE -->
						<DataContainer>
							<DataLabel forInput="street">Ulice</DataLabel>
							<InputContainer>
								<Form.Field {form} name="street">
									{#if !editCompanyForm}
										<DataPlaceholder>
											{emptyStringOnNull(data.company.street)}
										</DataPlaceholder>
									{:else}
										<Form.Control let:attrs>
											<Input
												{...attrs}
												bind:value={$formData.street}
												id="street"
												type="text"
												class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
											/>
										</Form.Control>
									{/if}
									{#if $errors.street}
										<InputErrorContainer>
											<Form.FieldErrors />
										</InputErrorContainer>
									{/if}
								</Form.Field>
							</InputContainer>
						</DataContainer>

						<!-- MĚSTO -->
						<DataContainer>
							<DataLabel forInput="street">Město</DataLabel>
							<InputContainer>
								<Form.Field {form} name="city">
									{#if !editCompanyForm}
										<DataPlaceholder>
											{emptyStringOnNull(data.company.city)}
										</DataPlaceholder>
									{:else}
										<Form.Control let:attrs>
											<Input
												{...attrs}
												bind:value={$formData.city}
												id="city"
												type="text"
												class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
											/>
										</Form.Control>
									{/if}
									{#if $errors.city}
										<InputErrorContainer>
											<Form.FieldErrors />
										</InputErrorContainer>
									{/if}
								</Form.Field>
							</InputContainer>
						</DataContainer>

						<!-- PSČ -->
						<DataContainer>
							<DataLabel forInput="street">PSČ</DataLabel>
							<InputContainer>
								<Form.Field {form} name="zip">
									{#if !editCompanyForm}
										<DataPlaceholder>
											{emptyStringOnNull(data.company.zip)}
										</DataPlaceholder>
									{:else}
										<Form.Control let:attrs>
											<Input
												{...attrs}
												bind:value={$formData.zip}
												id="zip"
												type="text"
												class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
											/>
										</Form.Control>
									{/if}
									{#if $errors.city}
										<InputErrorContainer>
											<Form.FieldErrors />
										</InputErrorContainer>
									{/if}
								</Form.Field>
							</InputContainer>
						</DataContainer>
					</form>
				</Card.Content>
			</Card.Root>

			<div class="flex flex-col gap-4">
				<ShowToAdminsManagersAndEmployees user={data.user} userInCompany={data.userInCompany}>
					<Card.Root class="flex flex-col gap-4 *:w-full p-8">
						<Card.Header class="p-0">
							<div class="flex justify-between items-center">
								<Card.Title tag="h2" class="text-xl font-semibold">Nabíjecí stanice</Card.Title>
								{#if data.user.role === 'ADMIN'}
									<ChargerForm
										formObj={data.chargerForm}
										companies={data.companies}
										keyIcon={false}
										bind:dialogOpen={chargerDialogOpen}
										selectedCompanyId={$page.params.companyId}
									/>
								{/if}
							</div>
							<Separator />
						</Card.Header>

						<Card.Content class="p-0">
							{#if data.chargers.length === 0}
								<TableSkeleton />
							{:else}
								{#key data.chargers}
									<DataTableChargers data={data.chargers} user={data.user} />
								{/key}
							{/if}
						</Card.Content>
					</Card.Root>

					<!-- CHARGER STATS -->
					<div class="grid grid-cols-3 gap-4">
						<CompanyDetailSubcard>
							<span slot="valueName">Nabíjecí stanice</span>
							<span slot="value">{data.chargerCount}</span>
						</CompanyDetailSubcard>
						<CompanyDetailSubcard>
							<span slot="valueName">Nabíjecí body</span>
							<span slot="value">{data.controllerCount}</span>
						</CompanyDetailSubcard>
						<CompanyDetailSubcard>
							<span slot="valueName">K dispozici</span>
							<span slot="value">{data.availableCount}</span>
						</CompanyDetailSubcard>
					</div>
				</ShowToAdminsManagersAndEmployees>

				<!-- LAST 10 CHARGING SESSIONS -->
				<Card.Root class="flex flex-col gap-4 *:w-full p-8">
					<Card.Header class="p-0">
						<Card.Title tag="h2" class="text-xl font-semibold">Poslední nabíjecí relace</Card.Title>
						<Separator />
					</Card.Header>

					<Card.Content class="p-0">
						{#if data.chargingSessions.length === 0}
							<TableSkeleton />
						{:else}
							<DataTableSessions data={data.chargingSessions} />
						{/if}
					</Card.Content>
				</Card.Root>

				<!-- CHARGING STATS -->
				<div class="grid grid-cols-3 gap-4">
					<CompanyDetailSubcard>
						<span slot="valueName">Počet nabíjecích relací</span>
						<span slot="value">{data.chargingStats.sessionCount}</span>
					</CompanyDetailSubcard>
					<CompanyDetailSubcard>
						<span slot="valueName">Celkem nabito</span>
						<span slot="value">{convertTokW(Number(data.chargingStats.sessionSum), 'Wh')}</span>
					</CompanyDetailSubcard>
					<CompanyDetailSubcard>
						<span slot="valueName">Průměrně nabito</span>
						<span slot="value">{convertTokW(Number(data.chargingStats.sessionAverage), 'Wh')}</span>
					</CompanyDetailSubcard>
				</div>
			</div>

			<ShowToAdminsManagersAndEmployees user={data.user} userInCompany={data.userInCompany}>
				<Card.Root class="flex flex-col gap-4 *:w-full p-8">
					<Card.Header class="p-0">
						<div class="flex justify-between items-center">
							<Card.Title tag="h2" class="text-xl font-semibold">Zaměstnanci</Card.Title>
							{#if data.user.role === 'ADMIN'}
								<EmployeeForm
									formObj={data.employeeForm}
									users={data.users}
									bind:dialogOpen={employeeDialogOpen}
									bind:comboboxOpen
								/>
							{/if}
						</div>
						<Separator />
					</Card.Header>

					<Card.Content class="p-0">
						{#if data.employees.length === 0}
							<TableSkeleton />
						{:else}
							{#key data.employees}
								<DataTableEmployees
									data={data.employees}
									rfidForm={data.employeeRfidForm}
									employeeForm={data.employeeForm}
									user={data.user}
									userInCompany={data.userInCompany}
								/>
							{/key}
						{/if}
					</Card.Content>
				</Card.Root>

				<Card.Root class="flex flex-col gap-4 *:w-full p-8">
					<Card.Header class="p-0">
						<div class="flex justify-between items-center">
							<Card.Title tag="h2" class="text-xl font-semibold">RFID čipy</Card.Title>
							<ShowToAdminsAndManagers user={data.user} userInCompany={data.userInCompany}>
								<RfidForm dialogOpen={otherRfidDialogOpen} formObj={data.otherRfidForm} />
							</ShowToAdminsAndManagers>
						</div>
						<Separator />
					</Card.Header>

					<Card.Content class="p-0">
						{#if data.rfidTags.length === 0}
							<TableSkeleton />
						{:else}
							{#key data.rfidTags}
								<DataTableRfid
									data={data.rfidTags}
									rfidForm={data.otherRfidForm}
									user={data.user}
									userInCompany={data.userInCompany}
								/>
							{/key}
						{/if}
					</Card.Content>
				</Card.Root>
			</ShowToAdminsManagersAndEmployees>
		</div>
	</div>
</section>
