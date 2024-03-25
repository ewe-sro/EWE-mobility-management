<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import logo from '$lib/assets/svgs/ewe_logo.svg';
</script>

<section
	class="flex justify-center items-center min-h-screen min-w-screen py-32 ~px-4/8 bg-neutral-100"
>
	<Card.Root class="relative w-full max-w-lg py-12 px-16 rounded-2xl">
		<slot />

		<img
			src={logo}
			alt="EWE s.r.o. logo"
			draggable="false"
			height="32"
			width="119"
			class="absolute -top-14 left-4 h-8 w-auto grayscale transition-[filter] duration-300 hover:grayscale-0"
		/>
	</Card.Root>
</section>
