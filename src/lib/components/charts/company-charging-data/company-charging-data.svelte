<script lang="ts">
	import { Scale } from '@unovis/ts';
	import {
		VisXYContainer,
		VisArea,
		VisLine,
		VisAxis,
		VisTooltip,
		VisCrosshair
	} from '@unovis/svelte';

	import MonthlyDifference from './misc/monthly-difference.svelte';

	import { tooltipTemplate } from './helpers';

	import { convertEnergyPower } from '$lib/utils';

	export let data;
	export let lastMonth;
	export let thisMonth;

	// Chart definitions
	const x = (d: any) => +new Date(d.id);
	const y = (d: any) => Number(d['used_energy']);

	const xScale = Scale.scaleTime();

	// Gradient background of the area graph
	const svgDefs = `
    <linearGradient id="gradient" gradientTransform="rotate(90)">
      <stop offset="30%" stop-color="#F190474D" />
      <stop offset="100%" stop-color="#EE761C00" />
    </linearGradient>`;
</script>

{#if thisMonth > 0}
	<div class="flex flex-col items-start gap-4">
		<div class="flex flex-col gap-1">
			<span class="text-sm text-muted-foreground font-medium">Nabito za posledních 30 dní</span>
			<div class="flex items-center gap-2">
				<span class="text-xl text-black dark:text-white font-bold leading-none"
					>{convertEnergyPower(Number(thisMonth), 'Wh')}</span
				>
				<MonthlyDifference {thisMonth} {lastMonth} />
			</div>
		</div>

		<VisXYContainer {data} {svgDefs} {xScale} height={200} padding={{ top: 12, bottom: 4 }}>
			<VisTooltip />
			<VisLine {x} {y} color="#EE761C" />
			<VisArea {x} {y} minHeight1Px={true} color="url(#gradient)" />
			<VisCrosshair {x} {y} template={tooltipTemplate} color="#F4A468" />
		</VisXYContainer>
	</div>
{/if}
