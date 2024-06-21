<script lang="ts">
	import { tick } from 'svelte';

	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import * as Form from '$lib/components/ui/form';
	import { Button } from '$lib/components/ui/button';

	import { ChevronsUpDown, Check } from 'lucide-svelte';

	export let form;
	export let formData;
	export let users;
	export let comboboxOpen: boolean;

	$: selectedUser = users.find((f: any) => f.user.id === formData.userId);

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

<Form.Field {form} name="userId">
	<Popover.Root bind:open={comboboxOpen} let:ids>
		<Form.Control let:attrs>
			<Form.Label>Uživatel</Form.Label>
			<Popover.Trigger asChild let:builder role="combobox">
				<Button builders={[builder]} variant="outline" class="items-center gap-1 w-full">
					{#if selectedUser}
						{selectedUser.user.email}
					{:else}
						Vybrat uživatele
					{/if}
					<ChevronsUpDown size="12" class="text-slate-600" />
				</Button>
			</Popover.Trigger>
			<input hidden value={formData.userId} name={attrs.name} />
		</Form.Control>
		<Popover.Content class="w-[calc(100%-3rem)] mt-1 p-0" align="center" side="bottom">
			<Command.Root>
				<Command.Input placeholder="Najít uživatele" />
				<Command.List>
					<Command.Empty class="py-3">Žádné výsledky nenalezeny.</Command.Empty>
					<Command.Group>
						{#each users as user}
							<Command.Item
								class="cursor-pointer"
								value="{user.profile.email}-{user.profile.firstName}-{user.profile.lastName}"
								onSelect={() => {
									formData.userId = user.user.id;
									closeAndFocusTrigger(ids.trigger);
								}}
							>
								<div class="flex flex-col">
									<span class="font-medium">{user.user.email}</span>
									{#if user.profile.firstName && user.profile.lastName}
										<span class="text-muted-foreground"
											>{user.profile.firstName} {user.profile.lastName}</span
										>
									{/if}
								</div>
								{#if user.user.id == formData.userId}
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
