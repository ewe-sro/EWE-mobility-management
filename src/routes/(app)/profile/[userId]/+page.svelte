<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { Separator } from '$lib/components/ui/separator';
	import { Input } from '$lib/components/ui/input/index.js';

	import Buttons from '$lib/components/editable-data/buttons/buttons.svelte';
	import DataContainer from '$lib/components/editable-data/data-container.svelte';
	import DataLabel from '$lib/components/editable-data/data-label.svelte';
	import DataPlaceholder from '$lib/components/editable-data/data-placeholder.svelte';
	import InputContainer from '$lib/components/editable-data/input-container.svelte';
	import RoleBadge from '$lib/components/role-badge/role-badge.svelte';

	import { convertTimestampToDate, emptyStringOnNull } from '$lib/utils';

	import { superForm } from 'sveltekit-superforms';

	export let data;

	const form = superForm(data.form);
	const { form: formData, message, enhance } = form;

	let editAccountForm = false;

	const toggleForm = () => {
		editAccountForm = !editAccountForm;

		// Set the data to the updated/original value
		$formData.firstName = data.profile.firstName;
		$formData.lastName = data.profile.lastName;
	};
</script>

<section class="py-16 ~px-4/8">
	<div class="max-w-5xl m-auto flex flex-col gap-4">
		<h1 class="text-3xl font-bold">{data.user.email}</h1>

		<Card.Root class="flex flex-col gap-8 *:w-full p-8">
			<Card.Header class="p-0">
				<div class="flex justify-between items-center">
					<Card.Title tag="h2" class="text-xl font-semibold">Osobní údaje</Card.Title>
					<Buttons bind:edit={editAccountForm} formId="profileForm" {toggleForm} />
				</div>
				<Separator />
			</Card.Header>

			<Card.Content class="p-0">
				<form
					class="flex flex-col gap-4"
					method="POST"
					use:enhance
					on:submit={toggleForm}
					id="profileForm"
				>
					<!-- EMAIL -->
					<DataContainer>
						<DataLabel>E-mail</DataLabel>
						<DataPlaceholder>{data.user.email}</DataPlaceholder>
					</DataContainer>

					<!-- JMÉNO -->
					<DataContainer>
						<DataLabel forInput="firstName">Jméno</DataLabel>
						<InputContainer>
							{#if !editAccountForm}
								<DataPlaceholder>
									{emptyStringOnNull(data.profile.firstName)}
								</DataPlaceholder>
							{:else}
								<Form.Field {form} name="firstName">
									<Form.Control let:attrs>
										<Input
											{...attrs}
											bind:value={$formData.firstName}
											id="firstName"
											type="text"
											class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
										/>
									</Form.Control>
								</Form.Field>
							{/if}
						</InputContainer>
					</DataContainer>

					<!-- PŘÍJMENÍ -->
					<DataContainer>
						<DataLabel forInput="lastName">Příjmení</DataLabel>
						<InputContainer>
							{#if !editAccountForm}
								<DataPlaceholder>
									{emptyStringOnNull(data.profile.lastName)}
								</DataPlaceholder>
							{:else}
								<Form.Field {form} name="lastName">
									<Form.Control let:attrs>
										<Input
											{...attrs}
											bind:value={$formData.lastName}
											id="lastName"
											type="text"
											class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
										/>
									</Form.Control>
								</Form.Field>
							{/if}
						</InputContainer>
					</DataContainer>

					{#if data.loggedUser.role === 'ADMIN'}
						<!-- ROLE -->
						<DataContainer>
							<DataLabel>Role</DataLabel>
							<DataPlaceholder>
								<RoleBadge role={data.user.role} />
							</DataPlaceholder>
						</DataContainer>
					{/if}
				</form>
			</Card.Content>
		</Card.Root>

		<Card.Root class="flex flex-col gap-8 *:w-full p-8">
			<Card.Header class="p-0">
				<Card.Title tag="h2" class="text-xl font-semibold">Uživatelské údaje</Card.Title>
				<Separator />
			</Card.Header>

			<Card.Content class="p-0">
				<DataContainer>
					<DataLabel>Datum založení účtu</DataLabel>
					<DataPlaceholder
						>{convertTimestampToDate(data.user.createdAt, 'datetime')}</DataPlaceholder
					>
				</DataContainer>
			</Card.Content>
		</Card.Root>

		{#if data.companies.length > 0}
			<Card.Root class="flex flex-col gap-8 *:w-full p-8">
				<Card.Header class="p-0">
					<Card.Title tag="h2" class="text-xl font-semibold">Firemní údaje</Card.Title>
					<Separator />
				</Card.Header>
				{#each data.companies as company}
					<Card.Content class="flex flex-col gap-4 p-0">
						<h3 class="text-lg font-semibold">{company.company.name}</h3>

						<DataContainer>
							<DataLabel>IČO</DataLabel>
							<DataPlaceholder>{emptyStringOnNull(company.company.ic)}</DataPlaceholder>
						</DataContainer>

						<DataContainer>
							<DataLabel>DIČ</DataLabel>
							<DataPlaceholder>{emptyStringOnNull(company.company.dic)}</DataPlaceholder>
						</DataContainer>

						<DataContainer>
							<DataLabel>Ulice</DataLabel>
							<DataPlaceholder>{emptyStringOnNull(company.company.street)}</DataPlaceholder>
						</DataContainer>

						<DataContainer>
							<DataLabel>Město</DataLabel>
							<DataPlaceholder>{emptyStringOnNull(company.company.city)}</DataPlaceholder>
						</DataContainer>

						<DataContainer>
							<DataLabel>PSČ</DataLabel>
							<DataPlaceholder>{emptyStringOnNull(company.company.zip)}</DataPlaceholder>
						</DataContainer>
					</Card.Content>
				{/each}
			</Card.Root>
		{/if}
	</div>
</section>
