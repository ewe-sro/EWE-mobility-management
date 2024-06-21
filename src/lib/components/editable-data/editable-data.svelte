<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';

	import DataPlaceholder from './data-placeholder.svelte';

	import { emptyStringOnNull } from '$lib/utils';

	export let form;
	export let inputValue: any;

	export let editVariable: boolean;
	export let data;
	export let inputId: string;
</script>

<div class="flex items-center">
	<div class="min-w-[15rem]">
		<Label for={inputId}><slot /></Label>
	</div>
	<div class="flex flex-col gap-1 w-full max-w-xs">
		{#if !editVariable}
			<DataPlaceholder>{emptyStringOnNull(data)}</DataPlaceholder>
		{:else}
			<Form.Field {form} name={inputId} class="space-y-0">
				<Form.Control let:attrs>
					<Input
						{...attrs}
						bind:value={inputValue}
						type="text"
						autocomplete="off"
						class="focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		{/if}
	</div>
</div>
