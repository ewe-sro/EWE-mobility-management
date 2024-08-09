<script>
	import VerifyEmailInput from './verify-email-input.svelte';

	let verificationCode;
</script>

<div class="container">
	<form method="POST" class="form">
		<VerifyEmailInput length={8} bind:code={verificationCode} />

		<span class="verification-code">verificationCode = {verificationCode}</span>
	</form>
</div>

<style>
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		width: 100vw;
		background-color: #f1f5f9;
	}

	.form {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		width: 100%;
		max-width: 32rem;
		padding: 1rem;
		background-color: #ffffff;
		border-radius: 0.5rem;
		border: 1px solid rgb(226 232 240);
	}

	.verification-code {
		color: black;
		font-weight: 600;
	}
</style>
