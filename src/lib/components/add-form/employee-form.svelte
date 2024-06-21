<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	import UserCombobox from './misc/user-combobox.svelte';

	import { TriangleAlert, Plus } from 'lucide-svelte';

	import { superForm } from 'sveltekit-superforms';

	export let formObj: any;
	export let users: any;
	export let dialogOpen: boolean;
	export let comboboxOpen: boolean;

	const form = superForm(formObj);
	const { form: formData, message, enhance } = form;
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger
		on:click={() => (dialogOpen = true)}
		class="flex items-center gap-1.5 h-auto px-2 py-1.5 bg-primary text-sm text-white font-medium rounded-md hover:bg-primary/90
active:ring-2 active:ring-offset-0 active:ring-primary/30 active:border-primary/70"
	>
		<Plus size="16" />
		Přidat zaměstnance
	</Dialog.Trigger>
	<Dialog.Content class="gap-8">
		<Dialog.Header>
			<Dialog.Title>Přidat zaměstnance</Dialog.Title>
			<Separator />
		</Dialog.Header>
		<form
			id="inviteUserForm"
			class="flex flex-col gap-6"
			method="POST"
			action="?/employeeForm"
			use:enhance
		>
			<UserCombobox {form} bind:formData={$formData} {users} bind:comboboxOpen />

			{#if $message}
				<span class="inline-flex items-center gap-1 text-sm text-destructive font-medium">
					<TriangleAlert size="16" />
					{$message}
				</span>
			{/if}
		</form>

		<div>
			<Separator class="mb-2" />
			<div class="flex justify-end gap-1.5">
				<Button
					on:click={() => (dialogOpen = false)}
					variant="ghost"
					class="h-auto px-2 py-1.5 text-sm
                active:ring-2 active:ring-offset-0 active:ring-accent/30 active:border-accent/70
            focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-accent/30 focus-visible:border-accent/70"
					>Zrušit</Button
				>
				<Button
					type="submit"
					form="inviteUserForm"
					class="flex items-center gap-1.5 h-auto px-2 py-1.5 bg-primary text-sm text-white font-medium rounded-md hover:bg-primary/90
            active:ring-2 active:ring-offset-0 active:ring-primary/30 active:border-primary/70
            focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					>Přidat zaměstnance</Button
				>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
