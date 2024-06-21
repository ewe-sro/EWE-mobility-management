<script lang="ts">
	import { tick } from 'svelte';

	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import * as Form from '$lib/components/ui/form';
	import { Button } from '$lib/components/ui/button';

	import { ChevronsUpDown, Check } from 'lucide-svelte';

	export let form;
	export let formData;
	export let companies;
	export let comboboxOpen: boolean;
	export let label = true;

	$: selectedCompany = companies.find((f: any) => f.company.id === formData.companyId);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId: string) {
		comboboxOpen = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<Form.Field {form} name="companyId">
	<Popover.Root bind:open={comboboxOpen} let:ids>
		<Form.Control let:attrs>
			{#if label}
				<Form.Label>Společnost</Form.Label>
			{/if}
			<Popover.Trigger asChild let:builder role="combobox">
				<Button
					builders={[builder]}
					variant="outline"
					class="items-center gap-1 w-full focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
				>
					{#if selectedCompany}
						{selectedCompany.company.name}
					{:else}
						Vybrat společnost
					{/if}
					<ChevronsUpDown size="12" class="text-slate-600" />
				</Button>
			</Popover.Trigger>
			<input hidden value={formData.companyId} name={attrs.name} />
		</Form.Control>
		<Popover.Content class="w-[calc(100%-3rem)] mt-1 p-0" align="center" side="bottom">
			<Command.Root>
				<Command.Input placeholder="Najít společnost" />
				<Command.List>
					<Command.Empty class="py-3">Žádné výsledky nenalezeny.</Command.Empty>
					<Command.Group>
						{#each companies as company}
							<Command.Item
								class="cursor-pointer"
								value="{company.company.name}-{company.company.ic}"
								onSelect={() => {
									formData.companyId = company.company.id;
									closeAndFocusTrigger(ids.trigger);
								}}
							>
								<div class="flex flex-col">
									<span class="font-medium">{company.company.name}</span>
									{#if company.company.ic}
										<span class="text-muted-foreground">IČO: {company.company.ic}</span>
									{/if}
								</div>
								{#if company.company.id == formData.companyId}
									<Check class="ml-auto h-4 w-4" />
								{/if}
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</Form.Field>
