<script>
	import * as Card from '$lib/components/ui/card';

	export let data;
</script>

<section class="py-32 ~px-4/8">
	<div class="container m-auto grid grid-cols-2 gap-12">
		{#each data.controllers as controller}
			<Card.Root>
				<Card.Header>
					<Card.Title>{controller.deviceUid}</Card.Title>
					<Card.Description>{controller.chargingPointName}</Card.Description>
				</Card.Header>
				<Card.Content>
					<p>Card Content</p>
				</Card.Content>
				<Card.Footer>
					<p>Card Footer</p>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
</section>
