<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import * as Form from '$lib/components/ui/form';

	export let form;
	export let formData;

	const roles = [
		{
			value: 'Manažer',
			label: 'Manažer',
			description: 'právo upravovat firemní údaje, odebírat zaměstnance'
		},
		{
			value: 'Zaměstnanec',
			label: 'Zaměstnanec',
			description: 'právo zobrazovat veškeré údaje a nabíjecí relace společnosti'
		},
		{
			value: 'Host',
			label: 'Host',
			description: 'právo zobrazovat pouze své údaje a nabíjecí relace'
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
				class="justify-center gap-1 hover:bg-muted *:last:hidden focus:ring-2 focus:ring-offset-0 focus:ring-primary/30 focus:border-primary/70"
			>
				<Select.Value placeholder="Vyberte roli zaměstnance" class="font-medium" />
			</Select.Trigger>
			<Select.Content>
				{#each roles as role}
					<Select.Item
						class="flex flex-col items-start px-2 first:*:top-1/2 first:*:-translate-y-1/2 first:*:left-auto first:*:right-2"
						value={role.value}
						label={role.label}
					>
						<span class="font-medium">{role.value}</span>
						<span class="text-muted-foreground">{role.description}</span>
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
		<input hidden bind:value={formData.role} name={attrs.name} />
	</Form.Control>
	<Form.FieldErrors />
</Form.Field>
