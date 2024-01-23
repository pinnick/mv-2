<script lang="ts">
	export let text: string;
	export let explicit: boolean;

	const path =
		'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 6h-3v2h3c.55 0 1 .45 1 1s-.45 1-1 1h-3v2h3c.55 0 1 .45 1 1s-.45 1-1 1h-4c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1h4c.55 0 1 .45 1 1s-.45 1-1 1z';
</script>

{text}
{#if explicit}
	<span class="ml-2 -mb-1">
		<svg width={18} height={18} viewBox="3 3 18 18" class="explicit-icon"
			><path fill="lightgray" d={path} /></svg
		>
	</span>
{/if}
