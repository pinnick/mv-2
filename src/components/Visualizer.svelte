<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { findDynamicScalingExponent, scaleExponentially, stepper, sumTopXInRange } from '../util';
	export let mediaElement: HTMLMediaElement;
	export let upperBounds: number[];
	export let sumTotal: number;
	let audioContext: AudioContext;
	let analyser: AnalyserNode;
	let bufferLength: number | undefined;
	let dataArray: Uint8Array;
	let animationId: number;
	let source: MediaElementAudioSourceNode;
	let fileSrc: string;
	// Each dot's height ranges from [0, 320]
	let interval: NodeJS.Timer;
	$: visible = !!mediaElement;
	$: barCount = upperBounds.length - 1;
	let heights: number[] = new Array(barCount).fill(0);
	const refreshRate = 144;

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
	};

	let audioContextCreated = false;
	$: if (visible) {
		if (!analyser) {
			audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
			analyser = audioContext.createAnalyser();
			analyser.fftSize = 1024 * 4;

			audioContextCreated = true;

			bufferLength = analyser.frequencyBinCount;
			dataArray = new Uint8Array(bufferLength);
		}
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
		interval = setInterval(calcHeights, 1300 / refreshRate);
	}

	$: if (mediaElement) {
		if (mediaElement.src !== fileSrc) {
			fileSrc = mediaElement.src;
			if (source) source.disconnect();

			source = audioContext.createMediaElementSource(mediaElement);
			source.connect(analyser);
			analyser.connect(audioContext.destination);
		}
	}
	onDestroy(() => {
		if (source) {
			source.disconnect();
		}
		if (audioContext) {
			audioContext.close();
		}
		visible = false;
		visible = true;
	});
</script>

{#if visible}
	<div
		class="w-full max-w-7xl h-[500px] flex items-center justify-center gap-[2px]"
		transition:fade
		style="--duration: {1 / refreshRate}s"
	>
		{#each heights as dot, i (i)}
			<div
				class="{dot < 10 ? 'bg-white/70' : 'bg-white'} w-[9px] min-h-[8px] rounded-full dot"
				style="height: {Math.max(dot * 1.3, 10)}px"
			/>
		{/each}
	</div>
{/if}

<style>
</style>
