import { convertTimestampToDate, convertEnergyPower } from '$lib/utils';

export const tooltipTemplate = (d: any) => {
  return `
<div class="flex flex-col gap-4 shadow-sm">
  <div class="flex flex-col">
    <span class="text-[0.70rem] uppercase text-muted-foreground">
      Společnost
    </span>
    <span class="text-sm text-muted-foreground font-medium">
      ${d.data.company.name}
    </span>
  </div>
  <div class="flex flex-col">
    <span class="text-[0.70rem] uppercase text-muted-foreground">
      Nabíjecí stanice
    </span>
    <span class="text-sm text-muted-foreground font-medium">
      ${d.data.charger.name}
    </span>
  </div>
  <div class="flex flex-col">
    <span class="text-[0.70rem] uppercase text-muted-foreground">
      Popis
    </span>
    <span class="text-sm text-muted-foreground font-medium">
      ${d.data.charger.description}
    </span>
  </div>
  <div class="flex flex-col">
    <span class="text-[0.70rem] uppercase text-muted-foreground">
      Nabito
    </span>
    <span class="font-bold text-foreground">
      ${convertEnergyPower(d.data.consumption, 'Wh')}
    </span>
  </div>
</div>
`;
};