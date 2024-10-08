<script lang="ts">
	import { page } from '$app/stores';

	import { Button } from '$lib/components/ui/button/';

	export let href;
</script>

<li class:active={$page.url.pathname.includes(href)} class="group">
	<Button
		{href}
		variant="ghost"
		class="flex justify-start gap-4 h-auto py-2.5 px-4 text-muted-foreground group-[&.active]:text-black dark:group-[&.active]:text-white group-[&.active]:bg-muted"
	>
		<slot />
	</Button>
</li>
