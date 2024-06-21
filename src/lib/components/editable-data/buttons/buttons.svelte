<script lang="ts">
	import EditButton from './edit-button.svelte';
	import SubmitCancelButton from './submit-cancel-button.svelte';

	export let edit = false;
	export let formId;
	export let toggleForm = () => {};
</script>

{#if !edit}
	<EditButton {toggleForm} />
{:else}
	<SubmitCancelButton {formId} {toggleForm} />
{/if}
