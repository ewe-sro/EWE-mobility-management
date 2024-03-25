<script lang="ts">
	import { superForm } from 'sveltekit-superforms';

	export let data;

	// Client API:
	const { form, errors, constraints, message, enhance } = superForm(data.form);
</script>

<h1>Register</h1>

{#if $message}
	<h3>{$message}</h3>
{/if}

<form method="POST" use:enhance>
	<div>
		<label for="email">E-mail</label>
		<input
			type="email"
			name="email"
			id="email"
			required
			aria-invalid={$errors.email ? 'true' : undefined}
			bind:value={$form.email}
		/>
		{#if $errors.email}<span class="invalid">{$errors.email}</span>{/if}
	</div>

	<div>
		<label for="password">Heslo</label>
		<input
			type="password"
			name="password"
			id="password"
			required
			aria-invalid={$errors.password ? 'true' : undefined}
			bind:value={$form.password}
		/>
		{#if $errors.password}<span class="invalid">{$errors.password}</span>{/if}
	</div>

	<div>
		<label for="password2">Potvrďte heslo</label>
		<input
			type="password"
			name="password2"
			id="password2"
			required
			aria-invalid={$errors.confirmPassword ? 'true' : undefined}
		/>
		{#if $errors.confirmPassword}<span class="invalid">{$errors.confirmPassword}</span>{/if}
	</div>

	<button>Register</button>
</form>
