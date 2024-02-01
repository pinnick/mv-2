<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { playing, metadata } from '$lib/store';
	import { cubicInOut } from 'svelte/easing';
	import { spring } from '$lib/utils/util';
	import { PlayState } from '$lib/types';

	const size = tweened<number>(undefined);

	const handleEnlarge = () => {
		size.set(1, { delay: 75, duration: 550, easing: spring });
	};
	const handleShrink = () => {
		size.set(0.75, {
			duration: 500,
			easing: cubicInOut
		});
	};

	$: $playing === PlayState.Playing ? handleEnlarge() : handleShrink();
</script>

<div class="rounded-lg my-7 w-full h-[416px] flex items-center justify-center">
	<div class="w-auto aspect-square h-full" style="transform: scale({$size})">
		{#if $metadata?.cover}
			<img
				src={$metadata.cover}
				alt=""
				class="w-auto h-full rounded-xl ease-in-cover transition-shadow duration-500 {$playing ===
				PlayState.Playing
					? 'shadow-2xl'
					: 'shadow-lg'}"
			/>
		{:else}
			<div class="w-full aspect-square flex items-center justify-center">
				<div class="w-full h-full aspect-square rounded-xl bg-neutral-600/70 overflow-hidden">
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
						<g fill="none" fill-rule="evenodd"
							><path fill="genericJoe" class="fill-genericJoe" d="M0 0h100v100H0z" /><path
								fill="rgba(235, 235, 245, 0.16"
								d="M34.098 73.66c3.256 0 8.153-2.404 8.153-8.873v-21c0-1.146.202-1.393 1.235-1.596L61.5 38.485c1.146-.247 1.595.045 1.595 1.078l.157 14.083c0 1.146-.584 1.865-1.64 2.09l-3.346.74c-4.493.966-6.694 3.078-6.694 6.447 0 3.347 2.718 5.795 6.424 5.795 3.257 0 8.064-2.291 8.064-8.738V28.76c0-2.112-.966-2.763-3.392-2.291l-21.27 4.402c-1.483.292-2.27 1.1-2.27 2.381l.136 25.358c0 1.056-.494 1.775-1.438 1.954l-3.504.72c-4.447.943-6.558 3.166-6.558 6.603 0 3.391 2.628 5.772 6.334 5.772Z"
								fill-rule="nonzero"
							/></g
						></svg
					>
				</div>
			</div>
		{/if}
	</div>
</div>
