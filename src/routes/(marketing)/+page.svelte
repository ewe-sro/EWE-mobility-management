<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	import logo from '$lib/assets/svgs/ewe_logo.svg';
</script>

<svelte:head>
	<title>Správa nabíjecích stanic – EMM</title>
</svelte:head>

<section class="flex min-h-screen ~p-4/8 bg-muted">
	<div
		class="container m-auto flex flex-col justify-center items-start gap-4 h-full w-full max-w-md"
	>
		<Card.Root class="flex-grow relative p-12 rounded-2xl shadow-xl">
			<Card.Header class="p-0 pb-8">
				<Card.Title tag="h1" class="text-2xl font-bold">EWE mobility management</Card.Title>
			</Card.Header>

			<Button
				href="/login"
				class="w-full text-white focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30 focus-visible:border-primary/70"
				>Přejít do aplikace</Button
			>

			<img
				src={logo}
				alt="EWE s.r.o. logo"
				draggable="false"
				height="32"
				width="119"
				class="absolute -top-14 left-4 h-8 w-auto grayscale transition-[filter] duration-300 hover:grayscale-0"
			/>
		</Card.Root>
		<ul class="flex items-center gap-2 ml-4">
			<li>
				<a
					class="text-muted-foreground text-sm font-semibold hover:text-black"
					href="https://www.ewe.cz"
					target="_blank"
				>
					© EWE s.r.o.
				</a>
			</li>
		</ul>
	</div>
</section>
