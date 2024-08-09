<script lang="ts">
	import { toggleMode } from 'mode-watcher';

	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	import { User, UserCog, LogOut, Sun, Moon } from 'lucide-svelte';

	import logo from '$lib/assets/svgs/ewe_logo.svg';
	import logo_white from '$lib/assets/svgs/ewe_logo_white.svg';

	export let user: any;
	export let profile: any;
</script>

<header class="sticky top-0 p-2 pb-0 z-50">
	<div
		class="flex justify-between items-center p-4 pr-8 bg-white dark:bg-slate-950 border border-border rounded-md shadow-sm"
	>
		<div class="flex items-center gap-4">
			<!-- EWE LOGO -->
			<a href="/dashboard">
				<img
					src={logo}
					alt="EWE s.r.o. logo"
					draggable="false"
					height="32"
					width="119"
					class="block dark:hidden h-9 w-auto"
				/>

				<img
					src={logo_white}
					alt="EWE s.r.o. logo"
					draggable="false"
					height="32"
					width="119"
					class="hidden dark:block h-9 w-auto"
				/>
			</a>

			<div class="flex flex-col gap-1">
				<span class="text-xl font-bold leading-none">EWE mobility management</span>
				<span class="text-muted-foreground font-light leading-none"
					>Vaše nabíjecí stanice pod kontrolou</span
				>
			</div>
		</div>

		<!-- SEARCH 
	<div class="relative w-full max-w-sm">
		<Search class="absolute top-1/2 -translate-y-1/2 left-3 text-muted-foreground" size="20" />
		<Input
			placeholder="Hledejte cokoliv"
			class="pl-11 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
		/>
	</div> -->

		<nav>
			<ul class="flex items-center gap-2">
				<li>
					<Button
						on:click={toggleMode}
						variant="ghost"
						class="p-1.5 text-muted-foreground hover:bg-muted rounded-lg"
					>
						<Sun class="block dark:hidden" />
						<Moon class="hidden dark:block" />
					</Button>
				</li>

				<li>
					<!-- PROFILE -->
					<DropdownMenu.Root preventScroll={false}>
						<DropdownMenu.Trigger class="group flex flex-col gap-1">
							<div
								class="p-1.5 text-muted-foreground hover:bg-muted hover:text-black hover:dark:text-white rounded-lg"
							>
								<User />
							</div>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="p-2 rounded-md" align="end">
							<DropdownMenu.Group>
								{#if profile.firstName && profile.lastName}
									<DropdownMenu.Label class="pb-0"
										>{profile.firstName} {profile.lastName}</DropdownMenu.Label
									>
									<DropdownMenu.Label class="py-0 text-muted-foreground font-normal"
										>{user.email}</DropdownMenu.Label
									>
								{:else}
									<DropdownMenu.Label>{user.email}</DropdownMenu.Label>
								{/if}
								<DropdownMenu.Separator class="my-2" />
								<DropdownMenu.Item
									href="/profile"
									class="flex items-center gap-2 text-primary data-[highlighted]:text-primary font-medium rounded-md hover:bg-primary/15 hover:cursor-pointer"
								>
									<UserCog size="16" />
									<span>Profil</span>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									href="/logout"
									class="flex items-center gap-2 text-primary data-[highlighted]:text-primary font-medium rounded-md hover:bg-primary/15 hover:cursor-pointer"
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
	</div>
</header>
