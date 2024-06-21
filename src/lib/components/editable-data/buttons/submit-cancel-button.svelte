<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	export let formId;
	export let toggleForm = () => {};
</script>

<!-- SUBMIT/CANCEL BUTTON -->
<div class="flex gap-1.5">
	<!-- CANCEL BUTTON -->
	<Button on:click={toggleForm} variant="outline" class="h-auto px-2 py-1.5 text-sm shadow-sm"
		>Zrušit</Button
	>
	<!-- CANCEL BUTTON -->
	<Button type="submit" form={formId} class="h-auto px-2 py-1.5 text-sm text-white shadow-sm"
		>Uložit</Button
	>
</div>
