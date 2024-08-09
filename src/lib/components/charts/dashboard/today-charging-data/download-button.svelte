<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	import { Download } from 'lucide-svelte';

	import { exportCsv } from '$lib/utils';

	export let data;
</script>

<Button
	on:click={() => exportCsv(data)}
	variant="outline"
	class="h-auto aspect-square p-2 text-muted-foreground"
>
	<Download size="16" />
</Button>
