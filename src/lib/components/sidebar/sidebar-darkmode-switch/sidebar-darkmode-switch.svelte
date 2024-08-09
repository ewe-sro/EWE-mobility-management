<script lang="ts">
	import { setMode, mode } from 'mode-watcher';

	import { Button } from '$lib/components/ui/button';

	import { Sun, Moon } from 'lucide-svelte';

	import { cn } from '$lib/utils';
</script>

<div class="flex gap-1 p-1 bg-muted rounded-md">
	<Button
		on:click={() => setMode('light')}
		class={cn(
			'flex-1 h-auto py-1 px-2 text-muted-foreground hover:bg-white dark:hover:bg-slate-950 hover:shadow',
			$mode === 'light' && 'bg-white text-black shadow'
		)}
		variant="ghost"
	>
		<Sun size="20" />
	</Button>

	<Button
		on:click={() => setMode('dark')}
		class={cn(
			'flex-1 h-auto py-1 px-2 text-muted-foreground hover:bg-white dark:hover:bg-slate-950 hover:shadow',
			$mode === 'dark' && 'bg-slate-950 text-white shadow'
		)}
		variant="ghost"
	>
		<Moon size="20" />
	</Button>
</div>
