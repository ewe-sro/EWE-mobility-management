<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	import { Edit } from 'lucide-svelte';

	export let toggleForm = () => {};
</script>

<!-- EDIT BUTTON -->
<Button
	on:click={toggleForm}
	variant="outline"
	class="flex items-center gap-1.5 h-auto px-2 py-1.5 text-sm shadow-sm"
>
	Upravit
	<Edit size="16" />
</Button>
