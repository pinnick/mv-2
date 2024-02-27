<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import {
		average,
		findDynamicScalingExponent,
		scaleExponentially,
		stepper,
		sumTopXInRange
	} from '$lib/utils/util';
	import { mediaElement, metadata, queue, playing } from '$lib/store';
	import { detect } from 'detect-browser';
	import { initGradient, setBassColor, disconnect, pause } from '$lib/Gradient/Gradient';
	import { PlayState } from '$lib/types';

	import { colord, extend } from 'colord';
	import mixPlugin from 'colord/plugins/mix';

	extend([mixPlugin]);

	import Dot from '$lib/components/Dot.svelte';

	export let upperBounds: number[];
	export let sumTotal: number;
	let audioContext: AudioContext;
	let analyser: AnalyserNode;
	let bufferLength: number | undefined;
	let dataArray: Uint8Array;
	let source: MediaElementAudioSourceNode;
	let fileSrc: string;
	$: visible = !!$mediaElement;
	$: barCount = upperBounds.length - 1;
	let prevBass: [number, number] = [0, 0];
	const bassSmoothing = 0.005;
	let heights: number[] = new Array(barCount).fill(0);
	let interval: NodeJS.Timeout | null = null;
	// let bassColor: string;
	const calcHeights = () => {
		if (!analyser) return;
		analyser.getByteFrequencyData(dataArray);
		const newHeights: number[] = [];
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
			newHeights.push(scaledBin);
		}

		if ($metadata && $metadata.colors.length > 1) {
			let primarySlice: number;
			let secondarySlice: number;
			switch (newHeights.length) {
				case 30:
					primarySlice = 1;
					secondarySlice = 1;
					break;
				case 45:
					primarySlice = 2;
					secondarySlice = 1;
					break;
				case 60:
					primarySlice = 2;
					secondarySlice = 2;
					break;
				default:
					primarySlice = 3;
					secondarySlice = 3;
			}
			if ($metadata.colors.length < 3) primarySlice += secondarySlice;
			const primaryAmp = average(newHeights.slice(0, primarySlice)) / 255;

			const secondaryAmp =
				average(newHeights.slice(primarySlice, primarySlice + secondarySlice)) / 255;

			let primaryMix = Math.max(primaryAmp, prevBass[0] - bassSmoothing);
			let secondaryMix = Math.max(secondaryAmp, prevBass[1] - bassSmoothing);

			const primary = colord($metadata.colors[0]).mix('#000000', primaryMix).toHex();
			const secondary =
				$metadata.colors.length > 3
					? colord($metadata.colors[1]).mix('#000000', secondaryMix).toHex()
					: undefined;

			setBassColor(primary, secondary);

			prevBass = [primaryMix, secondaryMix];
		}
		heights = newHeights;
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
			else analyser.smoothingTimeConstant = 0.87;
			bufferLength = analyser.frequencyBinCount;
			dataArray = new Uint8Array(bufferLength);
		}
	}
	$: if ($playing === PlayState.Playing && !interval) {
		interval = setInterval(calcHeights, 6);
	} else if (interval) {
		setTimeout(() => {
			if (interval) {
				clearInterval(interval);
				interval = null;
			}
		}, 500);
	}

	$: if ($mediaElement) {
		if ($mediaElement.src !== fileSrc) {
			fileSrc = $mediaElement.src;
			source?.disconnect();

			source = audioContext.createMediaElementSource($mediaElement);
			source.connect(analyser);
			analyser.connect(audioContext.destination);
			const prevSong: App.Track | undefined = $queue.tracks[$queue.current - 1];

			if (
				(prevSong === undefined || prevSong.metadata?.album !== $metadata?.album) &&
				$metadata?.colors
			) {
				initGradient('#gradient-canvas', $metadata?.colors, $queue.demo ? 150 : undefined);
			}
		}
	}
	onDestroy(() => {
		source.disconnect();
		audioContext.close();
		disconnect();
	});
</script>

{#if visible}
	<div
		class="w-full max-w-7xl h-[500px] flex items-center justify-center gap-[2px]"
		transition:fade|global
	>
		{#each heights as dot, i (i)}
			<Dot value={dot} />
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
