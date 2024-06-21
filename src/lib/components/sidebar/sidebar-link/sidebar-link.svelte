<script lang="ts">
	import { page } from '$app/stores';

	import { Button } from '$lib/components/ui/button/';

	export let href;
</script>

<li class:active={$page.url.pathname.includes(href)} class="group">
	<Button
		{href}
		class="flex justify-start gap-4 h-auto py-3 px-4 bg-transparent text-slate-700 dark:text-slate-300 group-[.active]:bg-primary group-[.active]:text-white group-[.active]:shadow
	group-[.active]:dark:bg-primary group-[.active]:dark:text-white hover:text-primary hover:bg-primary/15 dark:hover:text-white"
	>
		<slot />
	</Button>
</li>
