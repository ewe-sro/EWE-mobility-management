<script lang="ts">
	import { source } from 'sveltekit-sse';

	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';

	import ControllerStatus from '$lib/components/charging-status/controller-status.svelte';
	import ChargingDataContainer from '$lib/components/cards/controller-card/charging-data/charging-data-container.svelte';
	import ChargingDataName from '$lib/components/cards/controller-card/charging-data/charging-data-name.svelte';
	import ChargingDataValue from '$lib/components/cards/controller-card/charging-data/charging-data-value.svelte';

	import { Ellipsis } from 'lucide-svelte';

	import { convertEnergyPower, emptyStringOnNull, convertSecondsToTime } from '$lib/utils';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	import { cn } from '$lib/utils';

	export let data: any;
	export let status: 'unavailable' | 'offline' | 'online';

	let className: string | undefined = undefined;
	export { className as class };

	const apiData = source(
		`/api/charger/${data.charger.id}/controller/${data.controller.id}/charging-data`
	).select('charging-data');

	// if refreshed data from the API exists display it
	// if not display the load function data
	$: chargingData = !$apiData ? data : JSON.parse($apiData);
</script>

<Card.Root class="flex flex-col gap-8 w-full p-8 {className}">
	<Card.Header class="flex flex-row justify-between items-start gap-4 p-0 space-y-0">
		<div class="flex flex-col items-start gap-1">
			<Card.Title class="text-lg font-semibold"
				>{chargingData.controller.chargingPointName}</Card.Title
			>
			<ControllerStatus
				connectedState={status === 'online'
					? chargingData.controllerData?.connectedState
					: 'offline'}
			/>
		</div>

		<DropdownMenu.Root preventScroll={false}>
			<DropdownMenu.Trigger asChild let:builder>
				<Button
					variant="ghost"
					builders={[builder]}
					size="icon"
					class="actions group relative h-8 w-8 p-0"
				>
					<span class="sr-only">Otevřít menu</span>
					<Ellipsis
						size="16"
						class="text-muted-foreground group-hover:text-black dark:group-hover:text-white"
					/>
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Group>
					<DropdownMenu.Item
						href="/chargers/{chargingData.charger.id}/charging-controller/{chargingData.controller
							.id}"
						class="text-muted-foreground font-medium">Detail nabíjecího bodu</DropdownMenu.Item
					>
					<DropdownMenu.Item
						href="/chargers/{chargingData.charger.id}/charging-controller/{chargingData.controller
							.id}#charging-data"
						class="text-muted-foreground font-medium">Zobrazit nabíjecí data</DropdownMenu.Item
					>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Card.Header>

	<Card.Content class="flex flex-col justify-center items-center gap-4 p-0">
		{#if data.controllerData?.connectedState === 'connected' && status !== 'offline'}
			<ChargingDataContainer>
				<ChargingDataName>Doba nabíjení</ChargingDataName>
				<ChargingDataValue
					>{convertSecondsToTime(chargingData.controllerData?.chargeTime)}</ChargingDataValue
				>
			</ChargingDataContainer>

			<ChargingDataContainer>
				<ChargingDataName>Doba připojení</ChargingDataName>
				<ChargingDataValue
					>{convertSecondsToTime(chargingData.controllerData?.connectedTime)}</ChargingDataValue
				>
			</ChargingDataContainer>

			<ChargingDataContainer>
				<ChargingDataName>Nabíjecí výkon</ChargingDataName>
				<ChargingDataValue>
					{emptyStringOnNull(convertEnergyPower(chargingData.controllerData?.realPower, 'W'))}
				</ChargingDataValue>
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
			<Separator />
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
	</Card.Content>
</Card.Root>
