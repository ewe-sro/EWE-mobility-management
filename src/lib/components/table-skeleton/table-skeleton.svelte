<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<div class="flex flex-col gap-4">
	<div class="flex gap-4">
		<Skeleton class="h-6 w-1/5" />
		<Skeleton class="h-6 w-1/5" />
		<Skeleton class="h-6 w-1/5" />
		<Skeleton class="h-6 w-1/5" />
		<Skeleton class="h-6 w-1/5" />
	</div>
	<div class="relative h-48 w-full">
		<Skeleton class="h-full w-full" />
		<p class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-muted-foreground">
			Zatím tu nejsou žádná data
		</p>
	</div>
</div>
