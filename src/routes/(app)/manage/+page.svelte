<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator/index.js';

	import InviteUserForm from '$lib/components/add-form/invite-user-form.svelte';
	import TableSkeleton from '$lib/components/table-skeleton/table-skeleton.svelte';
	import Keybinding from '$lib/components/keybinding/keybinding.svelte';

	import DataTableUsers from './data-table-users.svelte';
	import DataTableInvited from './data-table-invited.svelte';

	export let data;

	// Used for tracking state of dialog
	let dialogOpen = false;
</script>

<svelte:head>
	<title>Nástroje správce – EMM</title>
</svelte:head>

<Keybinding key="n" bind:variable={dialogOpen} />

<section class="py-16 ~px-4/8">
	<div class="max-w-5xl m-auto flex flex-col gap-4">
		<h1 class="text-3xl font-bold">Nástroje správce</h1>

		<Card.Root class="flex flex-col gap-4 *:w-full p-8">
			<Card.Header class="p-0">
				<h2 class="text-xl font-semibold">Registrovaní uživatelé</h2>
				<Separator />
			</Card.Header>

			<Card.Content class="p-0">
				{#if data.users.length === 0}
					<TableSkeleton />
				{:else}
					{#key data.users}
						<DataTableUsers data={data.users} loggedUser={data.user.id} />
					{/key}
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root class="flex flex-col gap-4 *:w-full p-8">
			<Card.Header class="p-0">
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold">Pozvaní uživatelé</h2>
					<InviteUserForm {data} bind:dialogOpen />
				</div>
				<Separator />
			</Card.Header>

			<Card.Content class="p-0">
				{#if data.invitedUsers.length === 0}
					<TableSkeleton />
				{:else}
					{#key data.invitedUsers}
						<DataTableInvited
							data={data.invitedUsers}
							bind:invitedUserLength={data.invitedUsers.length}
						/>
					{/key}
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</section>
