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

	import { ArrowUp } from 'lucide-svelte';

	import { tooltipTemplate } from './helpers';

	import { convertTimestampToDate, convertEnergyPower } from '$lib/utils';

	export let data;

	const x = (d: any) => +new Date(d.id);
	const y = (d: any) => Number(d.usedEnergy);

	const xScale = Scale.scaleTime();

	// Date format for the X axis labels
	const tickFormat = (tick: Date) => convertTimestampToDate(tick, 'date');

	// Gradient background of the area graph
	const svgDefs = `
    <linearGradient id="gradient" gradientTransform="rotate(90)">
      <stop offset="30%" stop-color="#F190474D" />
      <stop offset="100%" stop-color="#EE761C00" />
    </linearGradient>
  `;
</script>

<div class="flex flex-col items-start gap-4">
	<div class="flex gap-2 ml-4">
		<div class="flex flex-col gap-1">
			<span class="text-sm text-muted-foreground">Nabito za posledních 30 dní</span>
			<div class="flex items-center gap-2">
				<span class="text-xl text-black font-bold leading-none"
					>{convertEnergyPower(52330, 'Wh')}</span
				>
				<Badge
					class="flex items-center gap-1 py-0.5 px-1 text-lime-600 bg-lime-100 font-medium border-lime-600 rounded-md"
					variant="outline"
				>
					<ArrowUp size="14" />
					+12,5 %
				</Badge>
			</div>
		</div>
		<Separator orientation="vertical" />
	</div>
	<VisXYContainer {data} {svgDefs} {xScale} height={200} padding={{ top: 12, bottom: 4 }}>
		<VisTooltip />
		<VisLine {x} {y} color="#EE761C" />
		<VisArea {x} {y} minHeight1Px={true} color="url(#gradient)" />
		<VisAxis type="x" {tickFormat} gridLine={false} />
		<VisCrosshair {x} {y} template={tooltipTemplate} color="#EE761C" />
	</VisXYContainer>
</div>
