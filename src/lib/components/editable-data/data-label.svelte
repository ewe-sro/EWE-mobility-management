<script lang="ts">
	import { Label } from '$lib/components/ui/label';

	export let forInput: string | undefined = undefined;
</script>

<div class="min-w-[15rem]">
	{#if !forInput}
		<span class="text-sm font-medium leading-none"><slot /></span>
	{:else}
		<Label for={forInput}><slot /></Label>
	{/if}
</div>
