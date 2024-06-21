<script lang="ts">
	export let key: string;
	export let variable: boolean;

	function on_key_down(event: any) {
		// `keydown` event is fired while the physical key is held down.

		// Assuming you only want to handle the first press, we early
		// return to skip.
		if (event.repeat) return;

		// In the switch-case we're updating our boolean flags whenever the
		// desired bound keys are pressed.
		switch (event.key) {
			case key:
				if (!variable) {
					variable = true;

					event.preventDefault();
					break;
				}
		}
	}
</script>

<svelte:window on:keydown={on_key_down} />
