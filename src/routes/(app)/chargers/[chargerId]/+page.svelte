<script lang="ts">
	import { page } from '$app/stores';

	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Form from '$lib/components/ui/form';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	import { Eye, EyeOff, Power } from 'lucide-svelte';

	import { superForm } from 'sveltekit-superforms';
	import { updateFlash } from 'sveltekit-flash-message';

	import { emptyStringOnNull, cn } from '$lib/utils';

	import Buttons from '$lib/components/editable-data/buttons/buttons.svelte';
	import DataContainer from '$lib/components/editable-data/data-container.svelte';
	import DataLabel from '$lib/components/editable-data/data-label.svelte';
	import DataPlaceholder from '$lib/components/editable-data/data-placeholder.svelte';
	import InputContainer from '$lib/components/editable-data/input-container.svelte';
	import ControllerCard from '$lib/components/cards/controller-card/controller-card.svelte';
	import ChargerStatus from '$lib/components/charging-status/charger-status.svelte';

	export let data;

	const form = superForm(data.form);
	const { form: formData, message, enhance } = form;

	// Used for tracking state of dialog
	let editChargerForm = false;

	let showMqttPassword = false;

	const toggleForm = () => {
		editChargerForm = !editChargerForm;

		// Set the data to the updated/original value
		$formData.name = data.charger.charger.name;
		$formData.description = data.charger.charger.description;
		$formData.companyId = data.charger.charger.companyId;
	};

	const restartCharger = async () => {
		await fetch(`/api/charger/${data.charger.charger.id}/restart`, {
			method: 'POST'
		});

		await updateFlash(page);
	};

	let actionParam = $page.url.searchParams.get('action');
	$: if (actionParam === 'edit') {
		editChargerForm = true;
	}

	// Check if any controller is charging
	let charging = false;

	for (const controller of data.chargingControllers) {
		if (controller.state === 'connected') charging = true;
	}
</script>

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

<section class="py-16 ~px-4/8">
	<div class="max-w-5xl m-auto flex flex-col gap-4">
		<div class="flex flex-col items-start gap-1">
			<h1 class="text-3xl font-bold">{data.charger.charger.name}</h1>
			<ChargerStatus status={data.charger.status} charger={data.charger.charger} align="start" />
		</div>

		<div class="flex flex-col gap-20">
			<Card.Root class="flex flex-col gap-8 *:w-full p-8">
				<Card.Header class="p-0">
					<div class="flex justify-between items-center">
						<Card.Title tag="h2" class="text-xl font-semibold">Údaje nabíjecí stanice</Card.Title>
						<Buttons bind:edit={editChargerForm} formId="chargerForm" {toggleForm} />
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
								{#if !editChargerForm}
									<DataPlaceholder>
										{data.charger.charger.name}
									</DataPlaceholder>
								{:else}
									<Form.Field {form} name="name">
										<Form.Control let:attrs>
											<Input
												{...attrs}
												bind:value={$formData.name}
												id="name"
												type="text"
												class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
											/>
										</Form.Control>
									</Form.Field>
								{/if}
							</InputContainer>
						</DataContainer>

						<!-- POPIS -->
						<DataContainer>
							<DataLabel forInput="description">Popis</DataLabel>
							<InputContainer>
								{#if !editChargerForm}
									<DataPlaceholder>
										{emptyStringOnNull(data.charger.charger.description)}
									</DataPlaceholder>
								{:else}
									<Form.Field {form} name="description">
										<Form.Control let:attrs>
											<Input
												{...attrs}
												bind:value={$formData.description}
												id="description"
												type="text"
												class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
											/>
										</Form.Control>
									</Form.Field>
								{/if}
							</InputContainer>
						</DataContainer>

						<!-- IP ADRESA -->
						<DataContainer>
							<DataLabel forInput="ipAddress">IP adresa</DataLabel>
							<InputContainer>
								{#if !editChargerForm}
									<DataPlaceholder>
										{emptyStringOnNull(data.charger.charger.ipAddress)}
									</DataPlaceholder>
								{:else}
									<Form.Field {form} name="ipAddress">
										<Form.Control let:attrs>
											<Input
												{...attrs}
												bind:value={$formData.ipAddress}
												id="ipAddress"
												type="text"
												class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
											/>
										</Form.Control>
									</Form.Field>
								{/if}
							</InputContainer>
						</DataContainer>

						<!-- MQTT PORT -->
						<DataContainer>
							<DataLabel forInput="mqttPort">MQTT port</DataLabel>
							<InputContainer>
								{#if !editChargerForm}
									<DataPlaceholder>
										{emptyStringOnNull(data.charger.charger.mqttPort)}
									</DataPlaceholder>
								{:else}
									<Form.Field {form} name="mqttPort">
										<Form.Control let:attrs>
											<Input
												{...attrs}
												bind:value={$formData.mqttPort}
												id="mqttPort"
												type="text"
												class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
											/>
										</Form.Control>
									</Form.Field>
								{/if}
							</InputContainer>
						</DataContainer>

						<!-- MQTT USER -->
						<DataContainer>
							<DataLabel forInput="mqttUser">MQTT uživatel</DataLabel>
							<InputContainer>
								{#if !editChargerForm}
									<DataPlaceholder>
										{emptyStringOnNull(data.charger.charger.mqttUser)}
									</DataPlaceholder>
								{:else}
									<Form.Field {form} name="mqttUser">
										<Form.Control let:attrs>
											<Input
												{...attrs}
												bind:value={$formData.mqttUser}
												id="mqttUser"
												type="text"
												class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
											/>
										</Form.Control>
									</Form.Field>
								{/if}
							</InputContainer>
						</DataContainer>

						<!-- MQTT HESLO -->
						<DataContainer>
							<DataLabel forInput="mqttPassword">MQTT heslo</DataLabel>
							<InputContainer class="relative">
								{#if !editChargerForm}
									{@const mqttPasswordType = !showMqttPassword ? 'password' : 'text'}
									<Input
										readonly
										type={mqttPasswordType}
										value={data.charger.charger.mqttPassword}
										class="relative flex items-center h-10 py-2 px-3 text-sm text-slate-600 border border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
									/>

									{#if data.charger.charger.mqttPassword}
										<Button
											variant="ghost"
											class="absolute top-1/2 right-1 -translate-y-1/2 h-auto p-2 !m-0 text-muted-foreground hover:text-black"
											on:click={() => (showMqttPassword = !showMqttPassword)}
										>
											{#if !showMqttPassword}
												<Eye size="16" />
											{:else}
												<EyeOff size="16" />
											{/if}
										</Button>
									{/if}
								{:else}
									<Form.Field {form} name="mqttPassword">
										<Form.Control let:attrs>
											<Input
												{...attrs}
												bind:value={$formData.mqttPassword}
												id="mqttPassword"
												type="password"
												class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
											/>
										</Form.Control>
									</Form.Field>
								{/if}
							</InputContainer>
						</DataContainer>

						<!-- REST API PORT -->
						<DataContainer>
							<DataLabel forInput="restApiPort">REST API port</DataLabel>
							<InputContainer>
								{#if !editChargerForm}
									<DataPlaceholder>
										{emptyStringOnNull(data.charger.charger.restApiPort)}
									</DataPlaceholder>
								{:else}
									<Form.Field {form} name="restApiPort">
										<Form.Control let:attrs>
											<Input
												{...attrs}
												bind:value={$formData.restApiPort}
												id="restApiPort"
												type="text"
												class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
											/>
										</Form.Control>
									</Form.Field>
								{/if}
							</InputContainer>
						</DataContainer>

						{#if data.charger.company}
							<!-- SPOLEČNOST -->
							<DataContainer>
								<DataLabel forInput="companyId">Společnost</DataLabel>
								<InputContainer>
									{#if !editChargerForm}
										<DataPlaceholder>
											{emptyStringOnNull(data.charger.company.name)}
										</DataPlaceholder>
									{:else}
										<Form.Field {form} name="companyId">
											<Form.Control let:attrs>
												<Input
													{...attrs}
													bind:value={$formData.companyId}
													id="companyId"
													type="text"
													class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
												/>
											</Form.Control>
										</Form.Field>
									{/if}
								</InputContainer>
							</DataContainer>
						{/if}
					</form>
				</Card.Content>
			</Card.Root>

			<div class="flex flex-col gap-4">
				<h2 class="text-xl font-semibold">Nabíjecí body</h2>

				<div class="grid grid-cols-3 gap-4 items-start">
					{#each data.chargingControllers as controller}
						<ControllerCard data={controller} />
					{/each}
				</div>
			</div>

			<div class="flex flex-col gap-4">
				<Card.Root class="flex flex-col gap-8 w-full p-8">
					<Card.Header class="flex flex-col gap-8 p-0">
						<div class="flex flex-col gap-2">
							<Card.Title tag="h2" class="text-xl font-semibold">Nastavení</Card.Title>
							<Separator />
						</div>
					</Card.Header>
					<Card.Content class="flex flex-col gap-4 p-0">
						<!-- NÁZEV NABÍJECÍ STANICE -->
						<DataContainer>
							<DataLabel>Restartovat nabíjecí stanici</DataLabel>
							<InputContainer>
								<DataPlaceholder>
									<AlertDialog.Root>
										<AlertDialog.Trigger asChild let:builder>
											<Button
												builders={[builder]}
												disabled={charging}
												variant="outline"
												class={cn('flex items-center gap-1.5 h-auto px-2 py-1.5 text-sm shadow-sm')}
											>
												<Power size="16" />
												Restartovat
											</Button>
										</AlertDialog.Trigger>
										<AlertDialog.Content>
											<AlertDialog.Header>
												<AlertDialog.Title
													>Jste si jistí, že chcete restartovat nabíjecí stanici?</AlertDialog.Title
												>
												<AlertDialog.Description>
													Nabíjecí stanici nebude možné několik minut použít.
												</AlertDialog.Description>
											</AlertDialog.Header>
											<AlertDialog.Footer>
												<AlertDialog.Cancel>Zrušit</AlertDialog.Cancel>
												<AlertDialog.Action
													on:click={restartCharger}
													class="flex items-center gap-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90"
												>
													<Power size="16" />
													Restartovat
												</AlertDialog.Action>
											</AlertDialog.Footer>
										</AlertDialog.Content>
									</AlertDialog.Root>
								</DataPlaceholder>
							</InputContainer>
						</DataContainer>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</div>
</section>
