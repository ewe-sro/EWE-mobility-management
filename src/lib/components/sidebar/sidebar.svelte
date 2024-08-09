<script lang="ts">
	import { Button } from '../ui/button';

	import { Home, PlugZap, Shield, Factory } from 'lucide-svelte';

	import SidebarLogo from './sidebar-logo/sidebar-logo.svelte';
	import SidebarLink from './sidebar-link/sidebar-link.svelte';
	import SidebarUser from './sidebar-user/sidebar-user.svelte';
	import SidebarDarkmodeSwitch from './sidebar-darkmode-switch/sidebar-darkmode-switch.svelte';

	export let user: any;
	export let profile: any;
</script>

<div class="flex-shrink-0 sticky top-0 flex flex-col justify-between h-screen w-full max-w-xs p-4">
	<div
		class="flex flex-col justify-between h-full pt-6 pb-4 px-4 bg-white dark:bg-slate-950 border border-border rounded-md shadow-sm"
	>
		<div class="flex flex-col gap-12">
			<SidebarLogo />

			<nav>
				<ul class="flex flex-col gap-2">
					<!-- DASHBOARD -->
					<SidebarLink href="/dashboard">
						<Home size="20" strokeWidth="2.25" />
						<span class="text-base leading-none">Dashboard</span>
					</SidebarLink>
					<!-- CHARGERS -->
					<SidebarLink href="/chargers">
						<PlugZap size="20" strokeWidth="2.25" />
						<span class="text-base leading-none">Nabíjecí stanice</span>
					</SidebarLink>
					<!-- COMPANIES -->
					<SidebarLink href="/companies">
						<Factory size="20" strokeWidth="2.25" />
						<span class="text-base leading-none">Společnosti</span>
					</SidebarLink>
					{#if user.role == 'ADMIN'}
						<!-- ADMIN PANEL -->
						<SidebarLink href="/manage">
							<Shield size="20" strokeWidth="2.25" />
							<span class="text-base leading-none">Nástroje správce</span>
						</SidebarLink>
					{/if}
				</ul>
			</nav>
		</div>

		<div class="flex flex-col gap-4">
			<SidebarUser {user} {profile} />
			<SidebarDarkmodeSwitch />
		</div>
	</div>
</div>
