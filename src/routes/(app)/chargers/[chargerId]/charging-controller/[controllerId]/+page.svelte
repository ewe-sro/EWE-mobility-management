<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';

	import DataContainer from '$lib/components/editable-data/data-container.svelte';
	import DataLabel from '$lib/components/editable-data/data-label.svelte';
	import DataPlaceholder from '$lib/components/editable-data/data-placeholder.svelte';
	import InputContainer from '$lib/components/editable-data/input-container.svelte';
	import TableSkeleton from '$lib/components/table-skeleton/table-skeleton.svelte';
	import DataTableSession from './data-table-session.svelte';
	import ChargingDataList from '$lib/components/cards/controller-card/charging-data/charging-data-list.svelte';

	import { Edit, Save, X } from 'lucide-svelte';

	import { superForm } from 'sveltekit-superforms';
	import SuperDebug from 'sveltekit-superforms';

	export let data;

	const form = superForm(data.form, { resetForm: false });
	const { form: formData, message, enhance } = form;

	let editPointName = false;

	export const resetPointValue = () => {
		editPointName = false;
		$formData.chargingPointName = data.controller.controller.chargingPointName;
	};
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
			<Breadcrumb.Page>{data.controller.controller.chargingPointName}</Breadcrumb.Page>
		</Breadcrumb.Item>
	</Breadcrumb.List>
</Breadcrumb.Root>

<section class="py-16 ~px-4/8">
	<div class="max-w-5xl m-auto flex flex-col gap-4">
		<!-- HEADING + ADD BUTTON -->
		<h1 class="text-3xl font-bold">{data.controller.controller.chargingPointName}</h1>

		<div class="flex flex-col gap-20">
			<!-- <SuperDebug data={$formData} /> -->
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
								{data.controller.controller.id}
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>

					<!-- NÁZEV NABÍJECÍHO BODU -->
					<DataContainer>
						<DataLabel forInput="chargingPointName">Název nabíjecího bodu</DataLabel>
						<InputContainer class="relative">
							{#if !editPointName}
								<DataPlaceholder class="gap-2">
									{data.controller.controller.chargingPointName}

									<Button
										variant="ghost"
										class="h-auto p-0 !m-0 text-muted-foreground hover:text-black"
										on:click={() => (editPointName = true)}
									>
										<Edit size="16" />
									</Button>
								</DataPlaceholder>
							{:else}
								<form
									method="POST"
									action="?/controllerForm"
									use:enhance
									on:submit={() => (editPointName = false)}
									id="controllerForm"
								>
									<Form.Field {form} name="chargingPointName" class="relative">
										<Form.Control let:attrs>
											<Input
												{...attrs}
												bind:value={$formData.chargingPointName}
												id="chargingPointName"
												type="text"
												class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
											/>
										</Form.Control>
									</Form.Field>
									<div class="absolute top-1/2 right-1 -translate-y-1/2 flex gap-1.5">
										<Button
											on:click={resetPointValue}
											variant="ghost"
											class="h-auto p-2 !m-0 text-muted-foreground hover:text-black"
										>
											<X size="16" />
										</Button>
										<Button
											type="submit"
											form="controllerForm"
											variant="ghost"
											class="h-auto p-2 !m-0 text-muted-foreground hover:text-black"
										>
											<Save size="16" />
										</Button>
									</div>
								</form>
							{/if}
						</InputContainer>
					</DataContainer>

					<!-- NÁZEV ZAŘÍZENÍ -->
					<DataContainer>
						<DataLabel>Název zařízení</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								{data.controller.controller.deviceName}
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>

					<!-- POZICE -->
					<DataContainer>
						<DataLabel>Pozice</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								{data.controller.controller.position}
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>

					<!-- VERZE HARDWARE -->
					<DataContainer>
						<DataLabel>Verze hardware</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								{data.controller.controller.hardwareVersion}
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>

					<!-- VERZE FIRMWARE -->
					<DataContainer>
						<DataLabel>Verze firmware</DataLabel>
						<InputContainer>
							<DataPlaceholder>
								{data.controller.controller.firmwareVersion}
							</DataPlaceholder>
						</InputContainer>
					</DataContainer>
				</Card.Content>
			</Card.Root>

			<Card.Root class="flex flex-col gap-8 *:w-full p-8">
				<Card.Header class="p-0">
					<Card.Title tag="h2" class="text-xl font-semibold">Stav nabíjecího bodu</Card.Title>
					<Separator />
				</Card.Header>

				<Card.Content class="p-0">
					<ChargingDataList
						chargerId={data.controller.controller.chargerId}
						controllerId={data.controller.controller.id}
					/>
				</Card.Content>
			</Card.Root>

			<Card.Root id="charging-data" class="flex flex-col gap-4 *:w-full p-8">
				<Card.Header class="p-0">
					<Card.Title tag="h2" class="text-xl font-semibold">Nabíjecí relace</Card.Title>
					<Separator />
				</Card.Header>

				{#if data.chargingSessions.length === 0}
					<TableSkeleton />
				{:else}
					<div class="flex flex-col gap-4">
						<DataTableSession data={data.chargingSessions} />
					</div>
				{/if}
			</Card.Root>
		</div>
	</div>
</section>
