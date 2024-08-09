<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<Card.Root class="flex flex-col gap-8 w-full p-8">
	<Card.Header class="flex flex-row justify-between items-start p-0 space-y-0">
		<Skeleton class="h-7 w-20" />
		<Skeleton class="h-7 w-7" />
	</Card.Header>

	<Card.Content class="grid grid-cols-4 gap-2 p-0 *:aspect-video">
		<Skeleton />
		<Skeleton />
		<Skeleton />
		<Skeleton />
	</Card.Content>
</Card.Root>
