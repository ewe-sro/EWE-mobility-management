<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';

	import { updateFlash } from 'sveltekit-flash-message';

	import { Ellipsis } from 'lucide-svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';

	export let id: string;

	const dispatch = createEventDispatcher();

	const deleteCharger = async (id: string) => {
		await fetch(`/api/invitation/cancel/${id}`, {
			method: 'DELETE'
		});

		// Emit an event to notify parent component to update its data
		dispatch('chargerDeleted', id);

		await updateFlash(page);
	};
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button
			variant="ghost"
			builders={[builder]}
			size="icon"
			class="actions group relative h-6 w-6 p-0 hover:bg-slate-200"
		>
			<span class="sr-only">Otevřít menu</span>
			<Ellipsis size="16" class="text-muted-foreground group-hover:text-black" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Group>
			<DropdownMenu.Item class="text-muted-foreground font-medium" href="/chargers/{id}"
				>Detail nabíjecí stanice</DropdownMenu.Item
			>
			<DropdownMenu.Item class="text-muted-foreground font-medium" href="/chargers/{id}?action=edit"
				>Upravit údaje</DropdownMenu.Item
			>
			<DropdownMenu.Item
				on:click={() => deleteCharger(id)}
				class="text-destructive font-medium hover:bg-red-100 hover:text-destructive"
			>
				Odstranit nabíjecí stanici
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
