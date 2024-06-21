<script lang="ts">
	import Header from '$lib/components/header/header.svelte';
	import Sidebar from '$lib/components/sidebar/sidebar.svelte';

	export let data;
</script>

<div class="flex flex-col">
	<Header user={data.user} profile={data.profile} />

	<div class="flex-grow flex">
		<Sidebar user={data.user} />
		<main id="main" class="flex-1 bg-slate-100 dark:bg-slate-800">
			<slot />
		</main>
	</div>
</div>
