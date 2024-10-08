<script lang="ts">
	import { source } from 'sveltekit-sse';

	import * as Card from '$lib/components/ui/card';

	import ControllerStatus from '$lib/components/charging-status/controller-status.svelte';
	import ChargingDataContainer from '$lib/components/cards/controller-card/charging-data/charging-data-container.svelte';
	import ChargingDataName from '$lib/components/cards/controller-card/charging-data/charging-data-name.svelte';
	import ChargingDataValue from '$lib/components/cards/controller-card/charging-data/charging-data-value.svelte';
	import LinkButton from '$lib/components/buttons/link-button.svelte';

	import {
		convertEnergyPower,
		emptyStringOnNull,
		convertSecondsToTime,
		getChargerStatus
	} from '$lib/utils';

	export let data: any;

	let className: string | undefined = undefined;
	export { className as class };

	// Get the charger status
	const status = getChargerStatus(data.charger.lastConnected);

	// Periodically get data from an API
	const apiData = source(
		`/api/charger/${data.charger.id}/controller/${data.controller.id}/charging-data`
	).select('charging-data');

	// if refreshed data from the API exists display it
	// if not display the load function data
	$: chargingData = !$apiData ? data : JSON.parse($apiData);
</script>

<Card.Root
	class="relative flex flex-col gap-4 p-4 before:absolute before:top-1/2 before:-translate-y-1/2 before:-left-[3.1875rem] before:h-0.5 before:w-6 before:bg-border {className}"
>
	<div class="flex justify-between gap-4">
		<h4 class="text-sm font-semibold">{data.controller.chargingPointName}</h4>
		<div class="flex items-center">
			<ControllerStatus
				connectedState={status === 'online'
					? chargingData.controllerData?.connectedState
					: 'offline'}
			/>
			<LinkButton
				class="hover:bg-transparent"
				href="/chargers/{data.charger.id}/charging-controller/{data.controller.id}"
				iconSize={12}
			>
				Zobrazit detail nabíjecího bodu
			</LinkButton>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-y-2 gap-x-8">
		{#if data.controllerData?.connectedState === 'connected' && status !== 'offline'}
			<ChargingDataContainer>
				<ChargingDataName>Doba nabíjení</ChargingDataName>
				<ChargingDataValue
					>{convertSecondsToTime(chargingData.controllerData?.chargeTime)}</ChargingDataValue
				>
			</ChargingDataContainer>

			<ChargingDataContainer>
				<ChargingDataName>Nabíjecí výkon</ChargingDataName>
				<ChargingDataValue>
					{emptyStringOnNull(convertEnergyPower(chargingData.controllerData?.realPower, 'W'))}
				</ChargingDataValue>
			</ChargingDataContainer>

			<ChargingDataContainer>
				<ChargingDataName>Doba připojení</ChargingDataName>
				<ChargingDataValue
					>{convertSecondsToTime(chargingData.controllerData?.connectedTime)}</ChargingDataValue
				>
			</ChargingDataContainer>

			<ChargingDataContainer>
				<ChargingDataName>Nabíjecí relace</ChargingDataName>
				<ChargingDataValue
					>{convertEnergyPower(
						chargingData.controllerData?.partEnergyRealPower,
						'Wh'
					)}</ChargingDataValue
				>
			</ChargingDataContainer>
		{/if}
		<ChargingDataContainer>
			<ChargingDataName>Celkem nabito</ChargingDataName>
			<ChargingDataValue
				>{convertEnergyPower(chargingData.controllerData?.energyRealPower, 'Wh')}</ChargingDataValue
			>
		</ChargingDataContainer>
		{#if chargingData.controllerData?.connectedState === 'disconnected' || status === 'offline'}
			<ChargingDataContainer>
				<ChargingDataName>Poslední nabíjecí relace</ChargingDataName>
				<ChargingDataValue
					>{convertEnergyPower(
						chargingData.controllerData?.partEnergyRealPower,
						'Wh'
					)}</ChargingDataValue
				>
			</ChargingDataContainer>
		{/if}
	</div>
</Card.Root>
