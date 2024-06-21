<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import * as Form from '$lib/components/ui/form';

	export let form;
	export let formData;

	const roles = [
		{
			value: 'manager',
			label: 'Manažer'
		},
		{
			value: 'employee',
			label: 'Zaměstnanec'
		}
	];

	$: selectedRole = formData.role
		? {
				label: formData.role,
				value: formData.role
			}
		: undefined;
</script>

<Form.Field {form} name="role">
	<Form.Control let:attrs>
		<Form.Label>Role</Form.Label>
		<Select.Root
			selected={selectedRole}
			onSelectedChange={(v) => {
				v && (formData.role = v.value);
			}}
		>
			<Select.Trigger
				{...attrs}
				class="focus:ring-2 focus:ring-offset-0 focus:ring-primary/30 focus:border-primary/70"
			>
				<Select.Value placeholder="Vyberte roli zaměstnance ve společnosti" class="font-medium" />
			</Select.Trigger>
			<Select.Content>
				{#each roles as role}
					<Select.Item value={role.value} label={role.label} />
				{/each}
			</Select.Content>
		</Select.Root>
		<input hidden bind:value={formData.role} name={attrs.name} />
	</Form.Control>
	<Form.Description>
		<ul class="list-disc list-inside ml-2 space-y-1.5">
			<li>Manažer</li>
			<li>Zaměstnanec</li>
		</ul>
	</Form.Description>
	<Form.FieldErrors />
</Form.Field>
