<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	import { superForm } from 'sveltekit-superforms';

	import EditButton from './buttons/edit-button.svelte';
	import SubmitCancelButton from './buttons/submit-cancel-button.svelte';

	export let formId;
	export let editVariable;
	export let heading;
	export let toggleForm = () => {};
</script>

<Card.Header class="flex flex-col gap-8 p-0">
	<div class="flex flex-col gap-2">
		<div class="flex justify-between items-center">
			<h2 class="text-xl font-semibold">{heading}</h2>
			{#if !editVariable}
				<EditButton {toggleForm} />
			{:else}
				<SubmitCancelButton {formId} {toggleForm} />
			{/if}
		</div>
		<Separator />
	</div>
	<slot />
</Card.Header>
