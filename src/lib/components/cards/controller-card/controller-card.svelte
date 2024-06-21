<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';

	import ControllerStatus from '$lib/components/charging-status/controller-status.svelte';
	import ChargingDataContainer from '$lib/components/cards/controller-card/charging-data/charging-data-container.svelte';
	import ChargingDataName from '$lib/components/cards/controller-card/charging-data/charging-data-name.svelte';
	import ChargingDataValue from '$lib/components/cards/controller-card/charging-data/charging-data-value.svelte';
	import ConnectionFailed from './charging-data/connection-failed.svelte';

	import { Ellipsis, Loader } from 'lucide-svelte';

	import { convertEnergyPower, emptyStringOnNull } from '$lib/utils';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	export let data: any;

	let chargingData: any;
	let loading = true;
	let error = false;

	async function getChargingData() {
		const response = await fetch(
			`/api/charger/${data.charger.id}/controller/${data.controller.id}/get-charging-data`
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

<Card.Root class="flex flex-col gap-8 w-full p-8">
	<Card.Header class="flex flex-row justify-between items-start gap-4 p-0 space-y-0">
		<div class="flex flex-col items-start gap-2">
			<Card.Title class="text-lg font-semibold">{data.controller.chargingPointName}</Card.Title>
			{#if loading && !error}
				<ControllerStatus status="unknown" />
			{:else if error}
				<ControllerStatus status="offline" />
			{:else}
				<ControllerStatus status={chargingData.state} />
			{/if}
		</div>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button
					variant="ghost"
					builders={[builder]}
					size="icon"
					class="actions group relative h-8 w-8 p-0"
				>
					<span class="sr-only">Otevřít menu</span>
					<Ellipsis size="16" class="text-muted-foreground group-hover:text-black" />
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Group>
					<DropdownMenu.Item
						href="/chargers/{data.charger.id}/charging-controller/{data.controller.id}"
						class="text-muted-foreground font-medium">Detail nabíjecího bodu</DropdownMenu.Item
					>
					<DropdownMenu.Item
						href="/chargers/{data.charger.id}/charging-controller/{data.controller
							.id}#charging-data"
						class="text-muted-foreground font-medium">Zobrazit nabíjecí data</DropdownMenu.Item
					>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Card.Header>

	<Card.Content class="flex flex-col justify-center items-center gap-4 p-0">
		{#if loading && !error}
			<div class="py-8">
				<Loader class="animate-spin-slow text-muted-foreground" />
			</div>
		{:else if error}
			<ConnectionFailed />
		{:else}
			{#if chargingData.state === 'connected'}
				<ChargingDataContainer>
					<ChargingDataName>Doba nabíjení</ChargingDataName>
					<ChargingDataValue>{chargingData.chargingTime}</ChargingDataValue>
				</ChargingDataContainer>

				<ChargingDataContainer>
					<ChargingDataName>Doba připojení</ChargingDataName>
					<ChargingDataValue>{chargingData.connectedTime}</ChargingDataValue>
				</ChargingDataContainer>

				<ChargingDataContainer>
					<ChargingDataName>Nabíjecí výkon</ChargingDataName>
					<ChargingDataValue>
						{emptyStringOnNull(convertEnergyPower(chargingData.realPower.value, 'W'))}
					</ChargingDataValue>
				</ChargingDataContainer>

				<ChargingDataContainer>
					<ChargingDataName>Nabíjecí relace</ChargingDataName>
					<ChargingDataValue
						>{convertEnergyPower(chargingData.partEnergyRealPower.value, 'Wh')}</ChargingDataValue
					>
				</ChargingDataContainer>
				<Separator />
			{/if}
			<ChargingDataContainer>
				<ChargingDataName>Celkem nabito</ChargingDataName>
				<ChargingDataValue
					>{convertEnergyPower(chargingData.energyRealPower.value, 'Wh')}</ChargingDataValue
				>
			</ChargingDataContainer>
			{#if chargingData.state === 'disconnected'}
				<ChargingDataContainer>
					<ChargingDataName>Poslední nabíjecí stanice</ChargingDataName>
					<ChargingDataValue
						>{convertEnergyPower(chargingData.partEnergyRealPower.value, 'Wh')}</ChargingDataValue
					>
				</ChargingDataContainer>
			{/if}
		{/if}
	</Card.Content>
</Card.Root>
