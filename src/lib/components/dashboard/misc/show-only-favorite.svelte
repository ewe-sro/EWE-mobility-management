<script lang="ts">
	import { Switch } from '$lib/components/ui/switch';

	export let data: any[];

	let className: string | undefined = undefined;
	export { className as class };

	// For tracking the state of the switch
	let checked: boolean;

	$: if (checked) {
		data = data.filter((item) => item.isFollowed === true);
		console.log(data);
	}
</script>

<div class="flex items-center gap-2 {className}">
	<span class="text-muted-foreground text-sm font-medium">Zobrazit pouze oblíbené</span>
	<Switch bind:checked />
</div>
