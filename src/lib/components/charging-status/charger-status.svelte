<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import * as Tooltip from '$lib/components/ui/tooltip';

	import StatusDot from './status-dot/status-dot.svelte';

	export let status;
	export let charger;
	export let align: 'center' | 'start' | 'end' | undefined = 'center';

	let alignOffset = align === 'start' ? -16 : 0;
</script>

<Tooltip.Root openDelay={0}>
	<Tooltip.Trigger asChild let:builder>
		<Button class="h-auto p-0" variant="ghost" builders={[builder]}>
			<Badge variant="outline" class="inline-flex items-center gap-1 pl-0.5 pr-2 bg-white">
				{#if status.mqttStatus && status.restApiStatus}
					<StatusDot variant="online" />
					<span class="text-muted-foreground">Online</span>
				{:else if (!status.mqttStatus && status.restApiStatus) || (status.mqttStatus && !status.restApiStatus)}
					<StatusDot variant="unavailable" />
					<span class="text-muted-foreground">Nedostupné</span>
				{:else}
					<StatusDot variant="offline" />
					<span class="text-muted-foreground">Offline</span>
				{/if}
			</Badge>
		</Button>
	</Tooltip.Trigger>
	<Tooltip.Content class="flex flex-col gap-2 p-4" side="bottom" {align} {alignOffset}>
		<div class="flex justify-between items-center gap-8 h-6">
			<span class="text-sm font-medium">IP adresa</span>
			<span class="text-sm text-muted-foreground">{charger.ipAddress}</span>
		</div>
		<div class="flex justify-between items-center gap-8 h-6">
			<span class="gap-2 text-sm font-medium">MQTT</span>
			<div class="flex items-center gap-1">
				{#if status.mqttStatus}
					<StatusDot variant="online">:{charger.mqttPort}</StatusDot>
					<span class="text-sm text-muted-foreground">Online</span>
				{:else}
					<StatusDot variant="offline">:{charger.mqttPort}</StatusDot>
					<span class="text-sm text-muted-foreground">Offline</span>
				{/if}
			</div>
		</div>
		<div class="flex justify-between items-center gap-8 h-6">
			<span class="text-sm font-medium">REST API</span>
			<div class="flex items-center gap-1">
				{#if status.restApiStatus}
					<StatusDot variant="online">:{charger.restApiPort}</StatusDot>
					<span class="text-sm text-muted-foreground">Online</span>
				{:else}
					<StatusDot variant="offline">:{charger.restApiPort}</StatusDot>
					<span class="text-sm text-muted-foreground">Offline</span>
				{/if}
			</div>
		</div>
	</Tooltip.Content>
</Tooltip.Root>
