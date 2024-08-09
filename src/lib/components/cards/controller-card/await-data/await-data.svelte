<script lang="ts">
	import { Loader2 } from 'lucide-svelte';

	export let promise;
	export let key: string;

	let className: string | undefined = undefined;
	export { className as class };
</script>

{#await promise}
	<Loader2 size="16" class="animate-spin-slow" />
{:then data}
	{@const value = data[key]}
	<span class={className}>
		<slot data={value} />
	</span>
{:catch error}
	Error
{/await}
