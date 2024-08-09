<script lang="ts">
	import { VisSingleContainer, VisDonut, VisTooltip } from '@unovis/svelte';
	import { Donut } from '@unovis/ts';

	import { tooltipTemplate } from './helpers';

	export let data;

	const value = (d: any) => d.consumption;
</script>

<VisSingleContainer {data}>
	<VisDonut {value} arcWidth={40} />
	<VisTooltip triggers={{ [Donut.selectors.segment]: tooltipTemplate }} />
</VisSingleContainer>
