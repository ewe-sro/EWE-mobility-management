<script lang="ts">
	import '../app.css';

	import { ModeWatcher } from 'mode-watcher';
	import FlashMessage from '$lib/components/flash-message/flash-message.svelte';
</script>

<!-- <ModeWatcher defaultMode={'light'} /> -->
<FlashMessage />

<slot />
