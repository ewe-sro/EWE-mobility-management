<script lang="ts">
	import logo from '$lib/assets/svgs/ewe_logo.svg';
	import logo_white from '$lib/assets/svgs/ewe_logo_white.svg';
</script>

<div class="flex flex-col items-center gap-4">
	<!-- EWE LOGO -->
	<a href="/dashboard">
		<img
			src={logo}
			alt="EWE s.r.o. logo"
			draggable="false"
			height="32"
			width="119"
			class="block dark:hidden h-12 w-auto"
		/>

		<img
			src={logo_white}
			alt="EWE s.r.o. logo"
			draggable="false"
			height="32"
			width="119"
			class="hidden dark:block h-12 w-auto"
		/>
	</a>

	<div class="flex flex-col items-center">
		<span class="text-base text-center font-bold">EWE mobility management</span>
		<span class="text-sm text-center text-muted-foreground">Nabíjecí stanice pod kontrolou</span>
	</div>
</div>
