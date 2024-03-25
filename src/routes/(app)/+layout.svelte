<script lang="ts">
	import Header from '$lib/components/header/Header.svelte';

	export let data;
</script>

<Header user={data.user} profile={data.profile} />
<slot />
