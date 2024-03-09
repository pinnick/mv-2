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
	import {
		initGradient,
		setBassColor,
		disconnect as disconnectGradient,
		pause
	} from '$lib/Gradient/Gradient';
	import { PlayState } from '$lib/types';

	import { colord, extend } from 'colord';
	import mixPlugin from 'colord/plugins/mix';

	extend([mixPlugin]);

	import Dot from '$lib/components/Dot.svelte';

	export let upperBounds: number[];
	export let sumTotal: number;
	let audioContext: AudioContext | undefined = undefined;
	let bufferLength: number | undefined = undefined;
	let analyser: AnalyserNode | undefined = undefined;
	let source: MediaElementAudioSourceNode | undefined = undefined;
	let dataArray: Uint8Array;
	let fileSrc: string;
	$: visible = !!$mediaElement;
	$: barCount = upperBounds.length - 1;
	let prevBass: [number, number] = [0, 0];

	const props = [
		{ bassSmoothing: 0.005, intervalDelay: 6 },
		{ bassSmoothing: 0.01, intervalDelay: 4 },
		{ bassSmoothing: 0.02, intervalDelay: 2 }
	];
	let currProps: 0 | 1 | 2 = 0;

	const handlePropsChange = () => {
		console.log('changed props');
		switch (currProps) {
			case 2:
				currProps = 0;
				break;
			default:
				currProps += 1;
				break;
		}
	};

	$: bassSmoothing = props[currProps].bassSmoothing;
	let heights: number[] = new Array(barCount).fill(0);
	let interval: NodeJS.Timeout | null = null;
	const calcHeights = () => {
		if (!analyser || !audioContext) return;
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
		interval = setInterval(calcHeights, props[currProps].intervalDelay);
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
			if (audioContext && analyser) {
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
	}
	onDestroy(() => {
		source?.disconnect();
		audioContext?.close();
		if (typeof window !== 'undefined') disconnectGradient();
	});
</script>

{#if visible}
	<div
		class="w-full max-w-7xl h-[500px] flex items-center justify-center gap-[2px]"
		transition:fade|global
		on:click={handlePropsChange}
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
