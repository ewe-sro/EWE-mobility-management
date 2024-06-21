<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	import { cn } from '$lib/utils';

	export let role: string;
</script>

<Badge
	class={cn('text-muted-foreground font-medium rounded-md', role === 'ADMIN' && 'bg-sky-100')}
	variant="outline"
>
	{role}
</Badge>
