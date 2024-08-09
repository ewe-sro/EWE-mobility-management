<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	import { X, Save } from 'lucide-svelte';

	export let formId: string;
	export let resetFn = () => {};
</script>

<div class="absolute top-1/2 right-1 -translate-y-1/2 flex gap-1.5">
	<Button
		on:click={resetFn}
		variant="ghost"
		class="h-auto p-2 !m-0 text-muted-foreground hover:text-black"
	>
		<X size="16" />
	</Button>
	<Button
		type="submit"
		form={formId}
		variant="ghost"
		class="h-auto p-2 !m-0 text-muted-foreground hover:text-black"
	>
		<Save size="16" />
	</Button>
</div>
