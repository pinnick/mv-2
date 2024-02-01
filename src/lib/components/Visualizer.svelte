<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import {
		findDynamicScalingExponent,
		scaleExponentially,
		stepper,
		sumTopXInRange
	} from '$lib/utils/util';
	import { mediaElement, metadata } from '$lib/store';
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
	const calcHeights = () => {
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
			analyser.smoothingTimeConstant = 0.85;
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
				class="{dot < 10 ? '!opacity-[0.7]' : ''} w-[9px] min-h-[8px] rounded-full dot"
				style="height: {Math.max(
					dot * 1.3,
					10
				)}px; background-color: color-mix(in srgb, {$metadata?.color ||
					'#ffffff'} 15%, #ffffff); opacity: {Math.min(Math.max(dot / 70, 0.75), 1)}"
			/>
		{/each}
	</div>
{/if}
