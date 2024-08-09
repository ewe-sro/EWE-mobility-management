<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';

	import { EllipsisVertical, User, LogOut } from 'lucide-svelte';
</script>

<DropdownMenu.Root preventScroll={false}>
	<DropdownMenu.Trigger asChild let:builder>
		<Button class="h-auto p-1" builders={[builder]} variant="ghost">
			<EllipsisVertical size="16" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" side="top" sideOffset={8}>
		<DropdownMenu.Group>
			<DropdownMenu.Item
				href="/profile"
				class="flex items-center gap-2 text-muted-foreground font-medium"
			>
				<User size="16" strokeWidth="2.5" />
				Profil
			</DropdownMenu.Item>
			<DropdownMenu.Item
				href="/logout"
				class="flex items-center gap-2 text-muted-foreground font-medium"
			>
				<LogOut size="16" strokeWidth="2.5" />
				Odhlásit se
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
