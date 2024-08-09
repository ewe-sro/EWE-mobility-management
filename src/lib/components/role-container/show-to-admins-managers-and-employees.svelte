<script lang="ts">
	export let user;
	export let userInCompany;
</script>

{#if user.role === 'ADMIN' || userInCompany?.role === 'Manažer' || userInCompany?.role === 'Zaměstnanec'}
	<slot />
{/if}
