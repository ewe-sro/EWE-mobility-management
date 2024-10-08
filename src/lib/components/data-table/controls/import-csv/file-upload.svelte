<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	import Dropzone from 'svelte-file-dropzone';

	import { CloudUpload, FileSpreadsheet, Trash2 } from 'lucide-svelte';

	import {
		formatBytes,
		getFilenameAndExtension,
		csvToArrayOfArrays,
		csvToArrayOfObjects
	} from '$lib/utils';

	export let files: any[];
	export let tableData: string[][] | false;
	export let apiData = {};

	const handleFilesSelect = (event: CustomEvent<any>) => {
		files = event.detail.acceptedFiles;

		for (let i = 0; i < files.length; i++) {
			const reader = new FileReader();
			reader.onload = () => {
				const binaryStr = reader.result;

				tableData = csvToArrayOfArrays(binaryStr);
				apiData = csvToArrayOfObjects(binaryStr);
			};

			reader.readAsText(files[i]);
		}
	};

	const removeUploadedFile = () => {
		files = [];
		tableData = [];
	};
</script>

<Dropzone
	on:drop={handleFilesSelect}
	multiple={false}
	accept=".csv"
	containerClasses="!py-12 !text-muted-foreground text-sm text-center !border-border !bg-muted !rounded-lg focus:!border-primary"
>
	<div class="flex flex-col items-center gap-4">
		<CloudUpload size="32" />
		Kliknutím nebo přetáhnutím do tohoto pole nahrajte CSV soubor
	</div>
</Dropzone>

{#if files[0]}
	{@const { filename, extension } = getFilenameAndExtension(files[0].path)}

	<div class="flex flex-col gap-2">
		<span class="text-sm font-medium">Nahraný soubor</span>
		<div class="flex items-center gap-4 p-2 rounded-lg border">
			<!-- ICON -->
			<div class="bg-muted p-2 rounded">
				<FileSpreadsheet class="text-muted-foreground" size="24" />
			</div>
			<div class="flex flex-col gap-1.5">
				<span class="text-sm font-medium leading-none">{filename}</span>
				<ul class="flex items-center gap-2 *:text-xs *:text-muted-foreground *:leading-none">
					<li>{extension.toUpperCase()}</li>
					<li>•</li>
					<li>{formatBytes(files[0].size)}</li>
				</ul>
			</div>

			<Button
				on:click={removeUploadedFile}
				class="h-auto ml-auto p-1.5 text-muted-foreground hover:text-destructive hover:bg-red-100"
				variant="ghost"
			>
				<Trash2 size="16" />
			</Button>
		</div>
	</div>
{/if}
