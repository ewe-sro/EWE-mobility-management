<script lang="ts">
	import Darkmode from '$lib/components/header/Darkmode.svelte';
	import { Input } from '$lib/components/ui/input';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	import { User, UserCog, LogOut } from 'lucide-svelte';

	import logo from '$lib/assets/svgs/ewe_logo.svg';

	export let user: any;
	export let profile: any;
</script>

<header class="flex justify-between items-center py-4 px-8">
	<!-- EWE LOGO -->
	<a href="/">
		<img
			src={logo}
			alt="EWE s.r.o. logo"
			draggable="false"
			height="32"
			width="119"
			class="h-9 w-auto"
		/>
	</a>

	<!-- SEARCH -->
	<Input class="w-full max-w-sm focus:border-0 focus:outline-0" />

	<nav>
		<ul class="flex items-center gap-2">
			<li>
				<Darkmode />
			</li>

			<li>
				<!-- PROFILE -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger class="flex flex-col gap-1">
						<div class="p-1.5 hover:bg-muted rounded-lg">
							<User class="text-muted-foreground" />
						</div>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="p-2 rounded-md">
						<DropdownMenu.Group>
							{#if profile.firstName && profile.lastName}
								<DropdownMenu.Label class="pb-0"
									>{profile.firstName} {profile.lastName}</DropdownMenu.Label
								>
								<DropdownMenu.Label class="py-0 text-slate-600 font-normal"
									>{user.email}</DropdownMenu.Label
								>
							{:else}
								<DropdownMenu.Label>{user.email}</DropdownMenu.Label>
							{/if}
							<DropdownMenu.Separator class="my-2" />
							<DropdownMenu.Item
								href="/profile"
								class="flex items-center gap-2 text-primary data-[highlighted]:text-primary font-medium rounded-md hover:cursor-pointer"
							>
								<UserCog size="16" />
								<span>Profil</span>
							</DropdownMenu.Item>
							<DropdownMenu.Item
								href="/logout"
								class="flex items-center gap-2 text-primary data-[highlighted]:text-primary font-medium rounded-md hover:cursor-pointer"
							>
								<LogOut size="16" />
								<span>Odhlásit se</span>
							</DropdownMenu.Item>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</li>
		</ul>
	</nav>
</header>
