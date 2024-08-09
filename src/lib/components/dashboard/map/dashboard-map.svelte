<script lang="ts">
	import { MapLibre } from 'svelte-maplibre';
</script>

<MapLibre
	center={[15.5, 49.8]}
	zoom={6}
	locale="cs"
	class="aspect-video w-full border shadow-sm rounded-lg"
	style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
/>
