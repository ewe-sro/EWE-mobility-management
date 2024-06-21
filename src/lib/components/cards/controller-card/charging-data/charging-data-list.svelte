<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	import { Separator } from '$lib/components/ui/separator';

	import DataContainer from '$lib/components/editable-data/data-container.svelte';
	import DataLabel from '$lib/components/editable-data/data-label.svelte';
	import DataPlaceholder from '$lib/components/editable-data/data-placeholder.svelte';
	import InputContainer from '$lib/components/editable-data/input-container.svelte';
	import ControllerStatus from '$lib/components/charging-status/controller-status.svelte';
	import ConnectionFailed from './connection-failed.svelte';

	import { emptyStringOnNull, convertEnergyPower } from '$lib/utils';

	export let chargerId: number;
	export let controllerId: string;

	let chargingData: any;
	let loading = true;
	let error = false;

	async function getChargingData() {
		const response = await fetch(
			`/api/charger/${chargerId}/controller/${controllerId}/get-charging-data`
		);

		chargingData = await response.json();

		if (response.ok) {
			loading = false;
		} else {
			error = true;
		}
	}

	let interval: NodeJS.Timeout;
	onMount(() => {
		getChargingData().then(() => {
			// If API call hasn't resulted in error keep updating the data
			if (!error) {
				// Set up interval to refresh data every second
				interval = setInterval(getChargingData, 1000);
			} else {
				// Set up interval to refresh data every 15 seconds
				interval = setInterval(getChargingData, 15000);
			}
		});
	});

	// Clean up interval on component destroy
	onDestroy(() => {
		if (interval) {
			clearInterval(interval);
		}
	});
</script>

<div class="flex flex-col gap-4">
	{#if loading && !error}
		<!-- STAV -->
		<DataContainer>
			<DataLabel>Stav</DataLabel>
			<InputContainer>
				<DataPlaceholder>
					<ControllerStatus status="unknown" />
				</DataPlaceholder>
			</InputContainer>
		</DataContainer>
	{:else if error}
		<ConnectionFailed />
	{:else}
		<!-- STAV -->
		<DataContainer>
			<DataLabel>Stav</DataLabel>
			<InputContainer>
				<DataPlaceholder>
					<ControllerStatus status={chargingData.state} />
				</DataPlaceholder>
			</InputContainer>
		</DataContainer>

		{#if chargingData.state === 'connected'}
			<!-- DOBA NABÍJENÍ -->
			<DataContainer>
				<DataLabel>Doba nabíjení</DataLabel>
				<InputContainer>
					<DataPlaceholder>
						{chargingData.chargingTime}
					</DataPlaceholder>
				</InputContainer>
			</DataContainer>

			<!-- DOBA PŘIPOJENÍ -->
			<DataContainer>
				<DataLabel>Doba připojení</DataLabel>
				<InputContainer>
					<DataPlaceholder>
						{chargingData.connectedTime}
					</DataPlaceholder>
				</InputContainer>
			</DataContainer>

			<!-- NABÍJECÍ VÝKON -->
			<DataContainer>
				<DataLabel>Nabíjecí výkon</DataLabel>
				<InputContainer>
					<DataPlaceholder>
						{emptyStringOnNull(convertEnergyPower(chargingData.realPower.value, 'W'))}
					</DataPlaceholder>
				</InputContainer>
			</DataContainer>

			<!-- NABÍJECÍ RELACE -->
			<DataContainer>
				<DataLabel>Nabíjecí relace</DataLabel>
				<InputContainer>
					<DataPlaceholder>
						{convertEnergyPower(chargingData.partEnergyRealPower.value, 'Wh')}
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
					{convertEnergyPower(chargingData.energyRealPower.value, 'Wh')}
				</DataPlaceholder>
			</InputContainer>
		</DataContainer>

		{#if chargingData.state === 'disconnected'}
			<!-- POSLEDNÍ NABÍJECÍ RELACE -->
			<DataContainer>
				<DataLabel>Poslední nabíjecí relace</DataLabel>
				<InputContainer>
					<DataPlaceholder>
						{convertEnergyPower(chargingData.partEnergyRealPower.value, 'Wh')}
					</DataPlaceholder>
				</InputContainer>
			</DataContainer>
		{/if}
	{/if}
</div>
