<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import {
		findDynamicScalingExponent,
		scaleExponentially,
		stepper,
		sumTopXInRange
	} from '$lib/utils/util';
	import { mediaElement, metadata, queue } from '$lib/store';
	import { detect } from 'detect-browser';
	import { extractColors } from 'extract-colors';
	import '$lib/stripe-gradient.js';

	export let upperBounds: number[];
	export let sumTotal: number;
	let audioContext: AudioContext;
	let analyser: AnalyserNode;
	let bufferLength: number | undefined;
	let dataArray: Uint8Array;
	let source: MediaElementAudioSourceNode;
	let fileSrc: string;
	let animationId: number;
	$: visible = !!$mediaElement;
	$: barCount = upperBounds.length - 1;
	let heights: number[] = new Array(barCount).fill(0);
	let bass: number = 0;
	const calcHeights = () => {
		bass = 0;
		if (!analyser) return;
		analyser.getByteFrequencyData(dataArray);
		heights = [];
		for (let i = 0; i < barCount; i++) {
			// upperBounds is an array containing upper frequency bounds for each bar.
			const lowerFreq = upperBounds[i];
			const upperFreq = upperBounds[i + 1];

			// Calculate the indices of the frequency bins that correspond to the lower and upper frequencies of this band.
			const lowerIndex = Math.ceil(
				(lowerFreq / (audioContext.sampleRate / 2)) * analyser.frequencyBinCount
			);
			const upperIndex = Math.floor(
				(upperFreq / (audioContext.sampleRate / 2)) * analyser.frequencyBinCount
			);

			const topBinAvg = sumTopXInRange(dataArray, lowerIndex, upperIndex, sumTotal);

			const dynamicScalingExponent = findDynamicScalingExponent(35, 3, 6, upperIndex);

			const steppedValue = stepper(topBinAvg, lowerIndex, 2000);

			const scaledBin = scaleExponentially(steppedValue, dynamicScalingExponent);
			if (i < 4) bass += scaledBin / (255 * 3 * 9);
			heights.push(scaledBin);
		}
		requestAnimationFrame(calcHeights);
	};

	$: if (visible) {
		if (!analyser) {
			audioContext = new AudioContext();
			analyser = audioContext.createAnalyser();
			// Scale the fftSize with the sample rate
			const power = Math.round(Math.log2(analyser.context.sampleRate / 24000));
			analyser.fftSize = 1024 * 2 ** Math.max(power, 2);
			const browser = detect();
			if (browser?.name === 'firefox') analyser.smoothingTimeConstant = 0.92;
			else analyser.smoothingTimeConstant = 0.82;
			bufferLength = analyser.frequencyBinCount;
			dataArray = new Uint8Array(bufferLength);
		}
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
		animationId = requestAnimationFrame(calcHeights);
	}

	$: if ($mediaElement) {
		// console.log(analyser);
		if ($mediaElement.src !== fileSrc) {
			fileSrc = $mediaElement.src;
			source?.disconnect();

			source = audioContext.createMediaElementSource($mediaElement);
			source.connect(analyser);
			analyser.connect(audioContext.destination);
			const prevSong: App.Track | undefined = $queue.tracks[$queue.current - 1];
			if (!prevSong || prevSong.metadata?.album !== $metadata?.album)
				(async () => {
					const colors = (await extractColors($metadata?.cover || ''))
						.map((c) => c.hex)
						.slice(0, 4);
					console.log(colors);
					const test = new Gradient({
						canvas: '#gradient-canvas',
						colors: colors
					});
					test.colors = '';
				})();
		}
	}
	onDestroy(() => {
		source.disconnect();
		audioContext.close();
	});
</script>

{#if visible}
	<div
		class="w-full max-w-7xl h-[500px] flex items-center justify-center gap-[2px]"
		transition:fade|global
	>
		{#each heights as dot, i (i)}
			<div
				class="w-[9px] min-h-[8px] rounded-full dot"
				style="height: {Math.max(
					dot * 1.15,
					10
				)}px; background-color: color-mix(in srgb, #ffffff  {dot / 2 + 30}%, {$metadata?.color ||
					'#ffffff'})"
			/>
		{/each}
	</div>
{/if}
<canvas
	id="gradient-canvas"
	data-transition-in
	class="-z-30 w-screen h-screen absolute top-0 left-0 opacity-25"
/>
<!-- <div
	class="w-screen h-screen absolute top-0 left-0 -z-20 brightness-75"
	style="opacity: {bass}; background-color: {$metadata?.color || '#ffffff'}"
></div> -->
