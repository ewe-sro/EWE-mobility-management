<script lang="ts">
	import * as Card from '$lib/components/ui/card';

	import Subcard from '$lib/components/cards/subcard/subcard.svelte';

	import { emptyStringOnNull } from '$lib/utils';

	export let company;
</script>

<Card.Root class="flex flex-col gap-4 w-full p-8">
	<div class="flex justify-between gap-8">
		<Card.Header class="flex flex-row justify-between items-start gap-4 p-0 space-y-0">
			<div class="flex flex-col gap-1">
				<Card.Title class="text-xl font-semibold">{company.company.name}</Card.Title>
				<Card.Description>
					{emptyStringOnNull(company.company.city)}<br />
					{emptyStringOnNull(company.company.street)}
				</Card.Description>
			</div>
		</Card.Header>
		<Card.Content class="grid grid-cols-3 gap-4 p-0">
			<Subcard class="flex flex-col">
				<span class="text-sm text-muted-foreground font-medium">Nabíjecí stanice</span>
				<span class="text-2xl font-bold">{company.chargerCount ?? 0}</span>
			</Subcard>
			<Subcard class="flex flex-col">
				<span class="text-sm text-muted-foreground font-medium">Nabíjecí body</span>
				<span class="text-2xl font-bold">{company.controllerCount ?? 0}</span>
			</Subcard>
			<Subcard class="flex flex-col">
				<span class="text-sm text-muted-foreground font-medium">Dostupné body</span>
				<span class="text-2xl font-bold">{company.availableCount ?? 0}</span>
			</Subcard>
		</Card.Content>
	</div>
</Card.Root>
