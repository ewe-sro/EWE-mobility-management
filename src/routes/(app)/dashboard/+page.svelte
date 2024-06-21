<script lang="ts">
	import * as Card from '$lib/components/ui/card';
</script>

<section class="h-full ~p-4/8">
	<div class="container m-auto flex flex-col gap-8 h-full">
		<h1 class="text-3xl font-bold">Nástěnka</h1>

		<div class="flex-1 grid grid-cols-12 items-start gap-4">
			<div class="col-span-12 flex gap-4">
				<Card.Root class="flex-1">
					<Card.Header>
						<Card.Title></Card.Title>
						<Card.Description></Card.Description>
					</Card.Header>
					<Card.Content>
						<p>Card Content</p>
					</Card.Content>
					<Card.Footer>
						<p>Card Footer</p>
					</Card.Footer>
				</Card.Root>
			</div>
		</div>
	</div>
</section>
