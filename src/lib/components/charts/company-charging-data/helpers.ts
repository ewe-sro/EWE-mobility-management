import { convertTimestampToDate, convertEnergyPower } from '$lib/utils';

export const tooltipTemplate = (d: any) => {
  return `
<div class="flex flex-col gap-4 shadow-sm">
<div class="flex flex-col">
  <span class="text-[0.70rem] uppercase text-muted-foreground">
    Datum
  </span>
  <span class="text-muted-foreground font-medium">
    ${convertTimestampToDate(d.id, 'date')}
  </span>
</div>
<div class="flex flex-col">
  <span class="text-[0.70rem] uppercase text-muted-foreground">
    Nabito
  </span>
  <span class="font-bold text-foreground">
    ${convertEnergyPower(d["used_energy"], 'Wh')}
  </span>
</div>
</div>
`;
};