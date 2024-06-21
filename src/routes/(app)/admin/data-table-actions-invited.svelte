<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';

	import { updateFlash } from 'sveltekit-flash-message';

	import { Ellipsis } from 'lucide-svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';

	export let id: string;

	const dispatch = createEventDispatcher();

	const resendInvitation = async (id: string) => {
		await fetch(`/api/invitation/${id}/resend`, {
			method: 'POST'
		});

		// Emit an event to notify parent component to update its data
		dispatch('invitationResend', id);

		await updateFlash(page);
	};

	const deleteInvitation = async (id: string) => {
		await fetch(`/api/invitation/${id}/cancel`, {
			method: 'DELETE'
		});

		// Emit an event to notify parent component to update its data
		dispatch('invitationDeleted', id);

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
			<DropdownMenu.Item
				on:click={() => resendInvitation(id)}
				class="text-muted-foreground font-medium"
			>
				Zaslat pozvánku znovu
			</DropdownMenu.Item>
			<DropdownMenu.Item
				on:click={() => deleteInvitation(id)}
				class="text-destructive font-medium hover:bg-red-100 hover:text-destructive"
			>
				Zrušit platnost pozvánky
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
