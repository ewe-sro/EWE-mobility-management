<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';

	import DataContainer from '$lib/components/editable-data/data-container.svelte';
	import DataLabel from '$lib/components/editable-data/data-label.svelte';
	import DataPlaceholder from '$lib/components/editable-data/data-placeholder.svelte';
	import InputContainer from '$lib/components/editable-data/input-container.svelte';
	import TableSkeleton from '$lib/components/table-skeleton/table-skeleton.svelte';
	import DataTableSession from '$lib/components/data-table/data-table-session.svelte';
	import ControllerStatus from '$lib/components/charging-status/controller-status.svelte';

	import { superForm } from 'sveltekit-superforms';
	import SuperDebug from 'sveltekit-superforms';

	import { convertEnergyPower, convertSecondstoTime, emptyStringOnNull } from '$lib/utils';

	export let data;

	let apiData: any;
	// if refreshed data from the API exists display it
	// if not display the load function data
	$: chargingData = !apiData ? data.controller : apiData;

	async function getChargingData() {
		const response = await fetch(
			`/api/charger/${data.controller.charger?.id}/controller/${data.controller.controller.id}/get-charging-data`
		);

		apiData = await response.json();
	}

	let interval: NodeJS.Timeout;
	onMount(() => {
		getChargingData().then(() => {
			// Set up interval to refresh data every 2 seconds
			interval = setInterval(getChargingData, 2000);
		});
	});

	// Clean up interval on component destroy
	onDestroy(() => {
		if (interval) {
			clearInterval(interval);
		}
	});
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
			<Breadcrumb.Link href="/chargers/{chargingData.controller.chargerId}"
				>{chargingData.charger?.name}</Breadcrumb.Link
			>
		</Breadcrumb.Item>
		<Breadcrumb.Separator />
		<Breadcrumb.Item>
			<Breadcrumb.Page>{chargingData.controller.chargingPointName}</Breadcrumb.Page>
		</Breadcrumb.Item>
	</Breadcrumb.List>
</Breadcrumb.Root>

<section class="py-16 ~px-4/8 flex flex-col gap-20">
	<div class="max-w-5xl m-auto flex flex-col gap-4 w-full">
		<!-- HEADING + ADD BUTTON -->
		<h1 class="text-3xl font-bold">{chargingData.controller.chargingPointName}</h1>

		<div class="flex flex-col gap-20">
			<!-- <SuperDebug data={$formData} /> -->
			<Card.Root class="flex flex-col gap-8 *:w-full p-8">
				<Card.Header class="p-0">
					<Card.Title tag="h2" class="text-xl font-semibold">Stav nabíjecího bodu</Card.Title>
					<Separator />
				</Card.Header>

				<Card.Content class="p-0">
					<!-- STAV -->
					<DataContainer>
						<DataLabel>Stav</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								<ControllerStatus status={chargingData.controllerData?.connectedState} />
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>

					{#if chargingData.controllerData?.connectedState === 'connected'}
						<!-- DOBA NABÍJENÍ -->
						<DataContainer>
							<DataLabel>Doba nabíjení</DataLabel>
							<InputContainer>
								<DataPlaceholder>
									{convertSecondstoTime(chargingData.controllerData.chargeTime)}
								</DataPlaceholder>
							</InputContainer>
						</DataContainer>

						<!-- DOBA PŘIPOJENÍ -->
						<DataContainer>
							<DataLabel>Doba připojení</DataLabel>
							<InputContainer>
								<DataPlaceholder>
									{convertSecondstoTime(chargingData.controllerData.connectedTime)}
								</DataPlaceholder>
							</InputContainer>
						</DataContainer>

						<!-- NABÍJECÍ VÝKON -->
						<DataContainer>
							<DataLabel>Nabíjecí výkon</DataLabel>
							<InputContainer>
								<DataPlaceholder>
									{emptyStringOnNull(
										convertEnergyPower(Number(chargingData.controllerData.realPower), 'W')
									)}
								</DataPlaceholder>
							</InputContainer>
						</DataContainer>

						<!-- NABÍJECÍ RELACE -->
						<DataContainer>
							<DataLabel>Nabíjecí relace</DataLabel>
							<InputContainer>
								<DataPlaceholder>
									{convertEnergyPower(
										Number(chargingData.controllerData.partEnergyRealPower),
										'Wh'
									)}
								</DataPlaceholder>
							</InputContainer>
						</DataContainer>

						<Separator />
					{/if}

					<!-- CELKEM NABITO -->
					<DataContainer>
						<DataLabel>Celkem nabito</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								{convertEnergyPower(Number(chargingData.controllerData?.energyRealPower), 'Wh')}
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>

					{#if data.controller.controllerData?.connectedState === 'disconnected'}
						<!-- POSLEDNÍ NABÍJECÍ RELACE -->
						<DataContainer>
							<DataLabel>Poslední nabíjecí relace</DataLabel>
							<InputContainer>
								<DataPlaceholder>
									{convertEnergyPower(
										Number(chargingData.controllerData.partEnergyRealPower),
										'Wh'
									)}
								</DataPlaceholder>
							</InputContainer>
						</DataContainer>
					{/if}
				</Card.Content>
			</Card.Root>

			<Card.Root class="flex flex-col gap-8 *:w-full p-8">
				<Card.Header class="p-0">
					<Card.Title tag="h2" class="text-xl font-semibold">Údaje nabíjecího bodu</Card.Title>
					<Separator />
				</Card.Header>

				<Card.Content class="flex flex-col gap-4 p-0">
					<!-- ID NABÍJECÍHO BODU -->
					<DataContainer>
						<DataLabel>ID nabíjecího bodu</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								{chargingData.controller.id}
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>

					<!-- NÁZEV NABÍJECÍHO BODU -->
					<DataContainer>
						<DataLabel forInput="chargingPointName">Název nabíjecího bodu</DataLabel>
						<InputContainer class="relative">
							<DataPlaceholder>
								{chargingData.controller.chargingPointName}
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>

					<!-- NÁZEV ZAŘÍZENÍ -->
					<DataContainer>
						<DataLabel>Název zařízení</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								{chargingData.controller.deviceName}
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>

					<!-- POZICE -->
					<DataContainer>
						<DataLabel>Pozice</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								{chargingData.controller.position}
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>

					<!-- VERZE HARDWARE -->
					<DataContainer>
						<DataLabel>Verze hardware</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								{chargingData.controller.hardwareVersion}
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>

					<!-- VERZE FIRMWARE -->
					<DataContainer>
						<DataLabel>Verze firmware</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								{chargingData.controller.firmwareVersion}
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>
				</Card.Content>
			</Card.Root>
		</div>
	</div>

	<Card.Root id="charging-data" class="flex flex-col gap-4 *:w-full p-8">
		<Card.Header class="p-0">
			<Card.Title tag="h2" class="text-xl font-semibold">Nabíjecí relace</Card.Title>
			<Separator />
		</Card.Header>

		{#if data.chargingSessions.length === 0}
			<TableSkeleton />
		{:else}
			<DataTableSession data={data.chargingSessions} />
		{/if}
	</Card.Root>
</section>
