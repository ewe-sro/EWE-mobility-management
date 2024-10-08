<script lang="ts">
	import * as Card from '$lib/components/ui/card';

	import logo from '$lib/assets/svgs/ewe_logo.svg';
</script>

<main id="main">
	<section
		class="flex justify-center items-center min-h-screen min-w-screen py-32 ~px-4/8 bg-muted"
	>
		<div class="flex flex-col gap-4 w-full max-w-md has-[#registerForm]:max-w-3xl">
			<Card.Root class="flex-grow relative ~p-8/12 rounded-2xl shadow-xl">
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
			<ul class="flex items-center gap-2 ml-4">
				<li>
					<a
						class="text-slate-600 text-sm font-semibold hover:text-black"
						href="https://www.ewe.cz"
						target="_blank"
					>
						© EWE s.r.o.
					</a>
				</li>
			</ul>
		</div>
	</section>
</main>
