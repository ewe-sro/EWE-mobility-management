<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	import { Edit } from 'lucide-svelte';

	export let onClick = () => {};
</script>

<Button
	variant="ghost"
	class="h-auto p-0 !m-0 text-muted-foreground hover:text-black"
	on:click={onClick}
>
	<Edit size="16" />
</Button>
