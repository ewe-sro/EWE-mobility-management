<script lang="ts">
	export let employee;
	export let rfidDescription;
</script>

{#if employee}
	<!-- Check if employee has first name and last name set -->
	{#if employee.firstName && employee.lastName}
		<span>{employee.firstName} {employee.lastName} ({employee.email})</span>
	{:else}
		{employee.email}
	{/if}
{:else if rfidDescription}
	<span>{rfidDescription}</span>
{/if}
