<script lang="ts">
	import { onMount } from 'svelte';

	export let length;
	export let code: string | null = null;

	// Array of the inputed values
	let values: any[] = [];

	// Check if all values are set and if so assign it to the output variable
	$: if (values.length === length && !values.includes(null)) {
		values.forEach((value, index) => {
			if (index === 0) {
				code = `${value}`;
			} else {
				code += `${value}`;
			}
		});
	} else {
		code = null;
	}

	// get all the input elements and put them in the inputs array
	let inputs: any[] = [];

	// Function for handling the key press
	const handleKey = (event, index) => {
		// If a letter (not a number) was inputted don't do anything
		if (Number.isNaN(+event.key)) {
			event.preventDefault();
			return;
		}

		values[index] = +event.key;

		// Check if the selected input is the last one
		// if it is, don't search for the next input
		if (index + 1 !== length) {
			inputs[index + 1].focus();
		}
	};

	// Function for handling different key press (arrow keys and backspace)
	const handleMoveAndBackspace = (event, index) => {
		switch (event.key) {
			case 'ArrowRight':
				event.preventDefault();

				if (index !== length) inputs[index + 1].focus();

				break;

			case 'ArrowLeft':
				event.preventDefault();

				if (index !== 0) inputs[index - 1].focus();

				break;

			case 'Backspace':
				event.preventDefault();

				if (index !== 0) {
					if (!values[index] || values[index] === '') {
						// if current cell is empty we want to backspace the previous cell
						inputs[index - 1].focus();

						values[index - 1] = null;
					} else {
						// if current cell has value delete it
						values[index] = null;
					}
				}

				break;
		}
	};

	// Function for pasting the code from the clipboard
	const pasteCode = (event) => {
		event.preventDefault();

		const pasteData = event.clipboardData.getData('text/plain').trim();

		if (pasteData.length === length) {
			for (let index = 0; index < length; index++) {
				values[index] = pasteData.charAt(index);
			}
		}
	};
</script>

<div class="flex justify-center items-center gap-1">
	{#each Array(length).fill(0) as value, index}
		<input
			on:keypress={(event) => handleKey(event, index)}
			on:keydown={(event) => handleMoveAndBackspace(event, index)}
			on:paste={pasteCode}
			class="code-input h-auto p-1 text-center align-middle text-3xl font-bold border border-border leading-none"
			type="text"
			bind:this={inputs[index]}
			bind:value={values[index]}
			data-index={index}
			maxlength={1}
		/>
	{/each}
</div>

<style>
	input {
		height: 2.5rem;
		width: 2.5rem;
		text-align: center;
		font-size: 1.75rem;
		font-weight: 700;
	}
</style>
