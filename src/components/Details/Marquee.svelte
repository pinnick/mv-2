<script lang="ts">
	import { onDestroy, createEventDispatcher } from 'svelte';
	import Text from './Text.svelte';
	export let text: string;
	export let bold = false;
	export let explicit = false;
	export let movement: number;
	const dispatch = createEventDispatcher();

	let finished = false;
	let textWidth: number;
	// +40 for text left margin
	$: width = -(textWidth + 40);
	let interval: NodeJS.Timeout;
	let containerWidth: number;
	$: shouldScroll = textWidth >= containerWidth - 50;
	$: offset = movement > width && shouldScroll ? movement : 0;

	$: if (width >= movement && offset === 0) {
		dispatch('updateState', 1);
		finished = true;
	}
	// -50 for text left margin & extra
	$: if (shouldScroll) {
		dispatch('updateState', 0);
		finished = false;
	}

	// If movement reset and we should scroll, set finised to false
	$: movement, movement === 0 && shouldScroll && (finished = false);

	$: if (!shouldScroll && textWidth && containerWidth) dispatch('updateState', -1);

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});
</script>

<div class="flex overflow-hidden w-full">
	<div
		class="marquee {bold ? 'top' : 'bottom'} text-2xl whitespace-nowrap"
		bind:clientWidth={containerWidth}
	>
		<div
			class="flex"
			style="transform: translateX({offset}px); color: {bold ? 'white' : 'lightgray'}"
		>
			<span class="mr-10 ml-10 flex items-center" bind:clientWidth={textWidth}
				><Text {text} {explicit} />
			</span>
			{#if shouldScroll}
				<span class="flex items-center"><Text {text} {explicit} /></span>
			{/if}
		</div>
	</div>
</div>

<style>
	.marquee {
		color: white;
		width: 100%;
		max-width: 444px;
		mask-size: 100% 100%;
		mask-repeat: no-repeat;
		mask-position: left;
	}
	.top {
		font-weight: 600;
		mask-image: linear-gradient(
			to right,
			transparent,
			rgba(0, 0, 0, 1) 10%,
			rgba(0, 0, 0, 1) 95%,
			transparent
		);
	}
	.bottom {
		font-weight: 400;
		margin-top: -0.25rem;
		mask-image: linear-gradient(
			to right,
			transparent,
			rgba(0, 0, 0, 0.7) 10%,
			rgba(0, 0, 0, 0.7) 95%,
			transparent
		);
	}
</style>
