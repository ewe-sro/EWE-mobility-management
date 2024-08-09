<script lang="ts">
	import DataContainer from '$lib/components/editable-data/data-container.svelte';
	import DataLabel from '$lib/components/editable-data/data-label.svelte';
	import DataPlaceholder from '$lib/components/editable-data/data-placeholder.svelte';
	import InputContainer from '$lib/components/editable-data/input-container.svelte';
	import RfidIdentifier from '../data-table/fields/rfid-identifier.svelte';

	export let employeeRfid;
	export let otherRfid;
</script>

{#if employeeRfid || otherRfid}
	<DataContainer>
		<DataLabel>RFID identifikátor</DataLabel>
		{#if employeeRfid}
			<InputContainer>
				<DataPlaceholder>
					<RfidIdentifier employee={employeeRfid} rfidDescription={otherRfid} />
				</DataPlaceholder>
			</InputContainer>
		{/if}
	</DataContainer>
{/if}
