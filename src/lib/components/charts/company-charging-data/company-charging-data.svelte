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

	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';

	import { ArrowUp, ArrowDown } from 'lucide-svelte';

	import { tooltipTemplate } from './helpers';

	import { cn, convertEnergyPower, round } from '$lib/utils';

	export let data;
	export let lastMonth;
	export let thisMonth;

	let monthlyDifference = ((thisMonth - lastMonth) / Math.abs(thisMonth)) * 100;

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

<div class="flex flex-col items-start gap-4">
	<div class="flex flex-col gap-1">
		<span class="text-sm text-muted-foreground font-medium">Nabito za posledních 30 dní</span>
		<div class="flex items-center gap-2">
			<span class="text-xl text-black font-bold leading-none"
				>{convertEnergyPower(Number(thisMonth), 'Wh')}</span
			>
			{#if thisMonth > 0}
				<Badge
					class={cn(
						'flex items-center gap-1 py-0.5 px-1.5 font-medium rounded-md',
						monthlyDifference > 0 && 'text-lime-600 bg-lime-100 border-lime-600',
						monthlyDifference < 0 && 'text-red-600 bg-red-100 border-red-600'
					)}
					variant="outline"
				>
					{#if monthlyDifference > 0}
						<ArrowUp size="14" />
					{:else}
						<ArrowDown size="14" />
					{/if}
					{round(monthlyDifference, 1)} %
				</Badge>
			{/if}
		</div>
	</div>

	<VisXYContainer {data} {svgDefs} {xScale} height={200} padding={{ top: 12, bottom: 4 }}>
		<VisTooltip />
		<VisLine {x} {y} color="#EE761C" />
		<VisArea {x} {y} minHeight1Px={true} color="url(#gradient)" />
		<VisCrosshair {x} {y} template={tooltipTemplate} color="#EE761C" />
	</VisXYContainer>
</div>
