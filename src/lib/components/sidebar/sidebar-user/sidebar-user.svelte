<script lang="ts">
	import SidebarUserDropdown from './sidebar-user-dropdown.svelte';
	import SidebarUserIcon from './sidebar-user-icon.svelte';

	import { User } from 'lucide-svelte';

	export let user;
	export let profile;
</script>

<div class="flex justify-between items-start gap-2 h-auto pl-1 text-muted-foreground">
	<div class="flex items-center gap-3">
		<div class="pt-2 px-1 pb-0 bg-muted rounded-full overflow-hidden">
			<SidebarUserIcon size={32} />
		</div>
		<div class="flex flex-col items-start gap-1">
			{#if profile.firstName && profile.lastName}
				<span class="text-sm text-black dark:text-white font-medium leading-none"
					>{profile.firstName} {profile.lastName}</span
				>
				<span class="text-sm text-muted-foreground font-normal leading-none">
					{user.email}
				</span>
			{:else}
				<span class="text-sm text-black dark:text-white font-medium leading-none">{user.email}</span
				>
			{/if}
		</div>
	</div>

	<SidebarUserDropdown />
</div>
