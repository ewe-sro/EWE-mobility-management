<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	import { cn } from '$lib/utils';

	export let role: string;
</script>

<Badge
	class={cn(
		'text-muted-foreground font-medium bg-white dark:bg-slate-100 rounded-md',
		role === 'ADMIN' && 'bg-black dark:bg-slate-700 text-white border-none'
	)}
	variant="outline"
>
	{role}
</Badge>
