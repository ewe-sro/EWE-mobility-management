<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { Separator } from '$lib/components/ui/separator';

	import DataContainer from '$lib/components/editable-data/data-container.svelte';
	import DataLabel from '$lib/components/editable-data/data-label.svelte';
	import DataPlaceholder from '$lib/components/editable-data/data-placeholder.svelte';
	import InputContainer from '$lib/components/editable-data/input-container.svelte';
	import SessionStatus from '$lib/components/charging-status/session-status.svelte';
	import RfidName from '$lib/components/rfid-name/rfid-name.svelte';
	import RfidIdentifier from '$lib/components/data-table/fields/rfid-identifier.svelte';

	import {
		emptyStringOnNull,
		convertTimestampToDate,
		convertSecondstoTime,
		convertEnergyPower
	} from '$lib/utils';

	export let data;
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
			<Breadcrumb.Link href="/chargers/{data.controller.controller.chargerId}"
				>{data.controller.charger?.name}</Breadcrumb.Link
			>
		</Breadcrumb.Item>
		<Breadcrumb.Separator />
		<Breadcrumb.Item>
			<Breadcrumb.Link
				href="/chargers/{data.controller.controller.chargerId}/charging-controller/{data.controller
					.controller.id}"
			>
				{data.controller.controller.chargingPointName}
			</Breadcrumb.Link>
		</Breadcrumb.Item>
		<Breadcrumb.Separator />
		<Breadcrumb.Item>
			<Breadcrumb.Page>Nabíjecí relace č. {data.chargingSession.id}</Breadcrumb.Page>
		</Breadcrumb.Item>
	</Breadcrumb.List>
</Breadcrumb.Root>

<section class="py-16 ~px-4/8">
	<div class="max-w-5xl m-auto flex flex-col gap-4">
		<!-- HEADING + ADD BUTTON -->
		<h1 class="text-3xl font-bold">Nabíjecí relace č. {data.chargingSession.id}</h1>

		<div class="flex flex-col gap-20">
			<Card.Root class="flex flex-col gap-8 *:w-full p-8">
				<Card.Header class="p-0">
					<Card.Title tag="h2" class="text-xl font-semibold">Detaily nabíjecí relace</Card.Title>
					<Separator />
				</Card.Header>

				<Card.Content class="flex flex-col gap-4 p-0">
					<!-- STAV -->
					<DataContainer>
						<DataLabel>Stav</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								<SessionStatus
									status={data.chargingSession.endTimestamp ? 'finished' : 'charging'}
								/>
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>

					<!-- ID NABÍJECÍ RELACE -->
					<DataContainer>
						<DataLabel>ID nabíjecí relace</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								{data.chargingSession.id}
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>

					<!-- RFID TAG -->
					<DataContainer>
						<DataLabel>RFID</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								{emptyStringOnNull(data.chargingSession.rfidTag)}
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>

					<!-- RFID IDENTIFIER -->
					<DataContainer>
						<DataLabel>RFID identifikátor</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								<RfidIdentifier
									employee={data.employeeRfid}
									rfidDescription={data.rfidDescription}
								/>
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>

					<!-- DATUM ZAČÁTKU NABÍJENÍ -->
					<DataContainer>
						<DataLabel>Datum začátku nabíjení</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								{convertTimestampToDate(data.chargingSession.startTimestamp, 'datetime')}
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>

					<!-- DATUM KONCE NABÍJENÍ -->
					<DataContainer>
						<DataLabel>Datum konce nabíjení</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								{convertTimestampToDate(data.chargingSession.endTimestamp, 'datetime')}
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>

					<!-- ČAS NABÍJENÍ -->
					<DataContainer>
						<DataLabel>Čas nabíjení</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								{convertSecondstoTime(data.chargingSession.duration)}
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>

					<!-- ČAS NABÍJENÍ -->
					<DataContainer>
						<DataLabel>Spotřebovaná energie</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								{convertEnergyPower(Number(data.chargingSession.consumption), 'Wh')}
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>

					<!-- CELKOVÁ SPOTŘEBA -->
					<DataContainer>
						<DataLabel>Celková spotřeba při začátku</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								{convertEnergyPower(Number(data.chargingSession.startRealPower), 'Wh')}
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>

					<!-- CELKOVÁ SPOTŘEBA -->
					<DataContainer>
						<DataLabel>Celková spotřeba při konci</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								{convertEnergyPower(Number(data.chargingSession.endRealPower), 'Wh')}
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</section>
