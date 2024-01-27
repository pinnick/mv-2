<script lang="ts">
	export let current: number;
	export let from = 0;
	export let to: number;
	export let active = true;
	let width: number;

	$: width = ((current - from) / (to - from)) * 100;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- TODO: MAKE COMPATIBLE WITH KEYBOARD -->
<div
	class="w-full h-6 {active ? 'cursor-pointer' : ''} flex items-center"
	draggable="false"
	on:mousedown
	on:mouseup
>
	<div class="w-full h-2 bg-white/20 rounded-full overflow-hidden">
		<div style="width: {width}%" class=" bg-white/50 h-full" />
	</div>
</div>
