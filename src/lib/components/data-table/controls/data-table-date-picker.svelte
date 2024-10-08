<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { RangeCalendar } from '$lib/components/ui/range-calendar';
	import * as Popover from '$lib/components/ui/popover';

	import type { DateRange } from 'bits-ui';
	import {
		startOfMonth,
		endOfMonth,
		startOfYear,
		endOfYear,
		CalendarDate,
		DateFormatter,
		type DateValue,
		getLocalTimeZone
	} from '@internationalized/date';

	import { CalendarIcon, CircleX } from 'lucide-svelte';

	export let pluginStates;
	export let dataLength;

	let datepickerOpen = false;

	const df = new DateFormatter('cs-CZ', {
		dateStyle: 'medium'
	});

	export let value: DateRange | undefined;
	export let startValue: DateValue | undefined = undefined;

	// filter presets
	const today = new Date();
	const todayCalendarDate = new CalendarDate(
		today.getFullYear(),
		today.getMonth() + 1,
		today.getDate()
	);

	let filterPresets = {
		last7Days: {
			start: todayCalendarDate.subtract({ days: 7 }),
			end: todayCalendarDate
		},
		last30Days: {
			start: todayCalendarDate.subtract({ days: 30 }),
			end: todayCalendarDate
		},
		thisMonth: {
			start: startOfMonth(todayCalendarDate),
			end: todayCalendarDate
		},
		lastMonth: {
			start: startOfMonth(todayCalendarDate.subtract({ months: 1 })),
			end: endOfMonth(todayCalendarDate.subtract({ months: 1 }))
		},
		thisYear: {
			start: startOfYear(todayCalendarDate),
			end: todayCalendarDate
		},
		lastYear: {
			start: startOfYear(todayCalendarDate.subtract({ years: 1 })),
			end: endOfYear(todayCalendarDate.subtract({ years: 1 }))
		}
	};

	const resetDateFilter = () => {
		value = undefined; // datepicker selected value
		startValue = undefined; // datepicker start value - before selection of both values
		datepickerOpen = false; // close the popover
	};

	// DataTable filtering logic
	const { filterValues } = pluginStates.colFilter; // column filter

	// fn for creating date object from supplied values from the calendar
	const createFilterValue = (calendarValue: any) => {
		if (!calendarValue) return null;

		const day = calendarValue.day;
		const month = Number(calendarValue.month) - 1;
		const year = calendarValue.year;

		return new Date(year, month, day);
	};

	$: if (value) {
		const startFilter = createFilterValue(value.start);
		const endFilter = createFilterValue(value.end);

		if ($filterValues['endTimestamp']) {
			$filterValues['endTimestamp'][0] = startFilter;
			$filterValues['endTimestamp'][1] = endFilter;
		} else {
			$filterValues['endTimestamp'] = [startFilter, endFilter];
		}
	} else {
		$filterValues['endTimestamp'] = undefined;
	}
</script>

<Popover.Root bind:open={datepickerOpen} openFocus>
	<Popover.Trigger asChild let:builder>
		<Button
			variant="outline"
			class="flex items-center gap-1.5 h-auto px-2 py-1.5 text-sm shadow-sm"
			builders={[builder]}
			disabled={dataLength === 0}
		>
			<CalendarIcon size="16" />

			{#if value && value.start}
				{#if value.end}
					{df.format(value.start.toDate(getLocalTimeZone()))} - {df.format(
						value.end.toDate(getLocalTimeZone())
					)}
				{:else}
					{df.format(value.start.toDate(getLocalTimeZone()))}
				{/if}
			{:else if startValue}
				{df.format(startValue.toDate(getLocalTimeZone()))}
			{:else}
				Datum
			{/if}
		</Button>
	</Popover.Trigger>
	<Popover.Content class="flex items-stretch gap-6 w-auto p-0 mt-2" align="end">
		<div class="flex flex-col justify-between items-start p-4">
			<div class="flex flex-col items-start gap-2 *:h-auto *:py-1.5 *:px-2 *:text-muted-foreground">
				<Button on:click={() => (value = filterPresets.last7Days)} variant="ghost">
					Posledních 7 dní
				</Button>
				<Button on:click={() => (value = filterPresets.last30Days)} variant="ghost">
					Posledních 30 dní
				</Button>
				<Button on:click={() => (value = filterPresets.thisMonth)} variant="ghost"
					>Tento měsíc</Button
				>
				<Button on:click={() => (value = filterPresets.lastMonth)} variant="ghost"
					>Minulý měsíc</Button
				>
				<Button on:click={() => (value = filterPresets.thisYear)} variant="ghost">Tento rok</Button>
				<Button on:click={() => (value = filterPresets.lastYear)} variant="ghost">Minulý rok</Button
				>
			</div>
			{#if value}
				<Button
					on:click={resetDateFilter}
					variant="outline"
					class="flex items-center gap-1.5 h-auto px-2 py-1.5 text-sm shadow-sm"
				>
					<CircleX size="16" />
					Resetovat
				</Button>
			{/if}
		</div>
		<Separator orientation="vertical" class="h-auto" />
		<RangeCalendar
			bind:value
			bind:startValue
			initialFocus
			numberOfMonths={2}
			locale="cs"
			placeholder={value?.start}
			class="p-4"
		/>
	</Popover.Content>
</Popover.Root>
