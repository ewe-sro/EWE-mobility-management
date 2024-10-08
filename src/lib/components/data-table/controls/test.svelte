<script lang="ts">
	import { invalidateAll } from '$app/navigation';
</script>

<button on:click={invalidateAll}> Načíst data </button>
