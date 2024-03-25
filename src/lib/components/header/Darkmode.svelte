<script lang="ts">
	import { Sun } from 'lucide-svelte';
	import { Moon } from 'lucide-svelte';
</script>

<button class="p-1.5 text-muted-foreground hover:bg-muted rounded-lg">
	<Sun class="block dark:hidden" />
	<Moon class="hidden dark:block" />
</button>
