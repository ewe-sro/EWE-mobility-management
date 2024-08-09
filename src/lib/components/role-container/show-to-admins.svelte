<script lang="ts">
	export let user;
</script>

{#if user.role === 'ADMIN'}
	<slot />
{/if}
