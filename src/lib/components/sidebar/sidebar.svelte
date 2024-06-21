<script lang="ts">
	import { page } from '$app/stores';

	import { Button } from '$lib/components/ui/button/';

	import { Cog, Home, PlugZap, Shield, Factory } from 'lucide-svelte';

	import SidebarLink from './sidebar-link/sidebar-link.svelte';

	export let user: any;
</script>

<div
	class="sticky top-[73px] flex flex-col justify-between h-[calc(100vh-73px)] w-full max-w-[18rem] p-4 pb-8 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-700"
>
	<nav>
		<ul class="flex flex-col gap-2">
			<!-- DASHBOARD -->
			<SidebarLink href="/dashboard">
				<Home size="20" strokeWidth="2.25" />
				<span class="text-base">Dashboard</span>
			</SidebarLink>
			<!-- CHARGERS -->
			<SidebarLink href="/chargers">
				<PlugZap size="24" strokeWidth="2.25" />
				<span class="text-base">Nabíjecí stanice</span>
			</SidebarLink>
			<!-- COMPANIES -->
			<SidebarLink href="/companies">
				<Factory size="24" strokeWidth="2.25" />
				<span class="text-base">Společnosti</span>
			</SidebarLink>
		</ul>
	</nav>

	<nav>
		<ul class="flex flex-col gap-2">
			<!-- SETTINGS -->
			<SidebarLink href="/settings">
				<Cog size="24" strokeWidth="2.25" />
				<span class="text-base">Nastavení</span>
			</SidebarLink>
			{#if user.role == 'ADMIN'}
				<!-- ADMIN PANEL -->
				<SidebarLink href="/admin">
					<Shield size="24" strokeWidth="2.25" />
					<span class="text-base">Nástroje správce</span>
				</SidebarLink>
			{/if}
		</ul>
	</nav>
</div>
