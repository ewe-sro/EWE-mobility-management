<script lang="ts">
	import Sidebar from '$lib/components/sidebar/sidebar.svelte';

	export let data;
</script>

<div class="flex bg-slate-100 dark:bg-slate-800">
	<Sidebar user={data.user} profile={data.profile} />
	<main id="main" class="flex-1">
		<slot />
	</main>
</div>
