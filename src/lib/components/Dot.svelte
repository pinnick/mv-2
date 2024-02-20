<script lang="ts">
	import { metadata } from '$lib/store';
	import { colord, extend } from 'colord';
	import mixPlugin from 'colord/plugins/mix';

	extend([mixPlugin]);

	export let value: number;

	$: height = Math.max(Math.round(value * 1.15), 10);

	$: color = colord($metadata?.accent || '#cccccc')
		.mix('#ffffff', Math.min(1, (value + 15) / 100))
		.toHex();
</script>

<div
	class="w-[9px] min-h-[8px] rounded-full dot"
	style="height: {height}px; background-color: {color}"
/>
