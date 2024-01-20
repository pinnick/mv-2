<script lang="ts">
	import { buttons } from '../../constants';
	export let text: string;
	export let explicit: boolean;
</script>

{text}
{#if explicit}
	<span class="ml-2 -mb-1">
		<svg width={18} height={18} viewBox="3 3 18 18" class="explicit-icon"
			><path fill="lightgray" d={buttons.explicit} /></svg
		>
	</span>
{/if}
