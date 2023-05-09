<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Howl } from 'howler';
	import { fillRoundRect, customMapping } from '../util';

	export let howl: Howl;
	export let mediaElement: HTMLMediaElement;
	export let frequencyBounds: { low: number; high: number };
	export let scalingExponent: number;
	export let logScaleFactor: number;
	let canvas: HTMLCanvasElement;
	let canvasCtx: CanvasRenderingContext2D;
	let audioContext: AudioContext;
	let analyser: AnalyserNode;
	let bufferLength: number | undefined;
	let dataArray: Uint8Array;
	let animationId: number;
	let source: MediaElementAudioSourceNode;

	onMount(() => {
		const context = canvas.getContext('2d');
		if (context === null) {
			console.error('Failed to get 2D rendering context');
			return;
		}
		canvasCtx = context;
	});

	onDestroy(() => {
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
		if (source) {
			source.disconnect();
		}
		if (audioContext) {
			audioContext.close();
		}
	});

	$: ready = frequencyBounds.high !== frequencyBounds.low;
	let prevDataArray = bufferLength ? new Uint8Array(bufferLength) : [];
	let lastUpdateTime = performance.now();

	function draw() {
		if (!analyser) return;

		const refreshRate = 100;
		const elapsedTime = performance.now() - lastUpdateTime;
		const blendFactor = Math.min(elapsedTime / (1000 / refreshRate), 1);

		if (elapsedTime > 1000 / refreshRate) {
			prevDataArray = new Uint8Array(dataArray);
			analyser.getByteFrequencyData(dataArray);
			lastUpdateTime = performance.now();
		}

		canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

		const barCount = 120;
		const bassBarCount = Math.round(barCount * 0.15);
		const midBarCount = Math.round(barCount * 0.7);
		// const customMapping = barCount - (bassBarCount + midBarCount);

		const barWidth = canvas.width / barCount - 2;
		let x = 0;

		for (let i = 0; i < barCount; i++) {
			const scaleFactor = i / (barCount - 1);
			const freq = customMapping(scaleFactor, logScaleFactor);
			const decimalIndex = (freq / (audioContext.sampleRate / 2)) * analyser.frequencyBinCount;
			const lower = Math.floor(decimalIndex);
			const upper = Math.ceil(decimalIndex);
			const weight = decimalIndex - Math.floor(decimalIndex);

			const lowerValue =
				prevDataArray[lower] + (dataArray[lower] - prevDataArray[lower]) * blendFactor;
			const upperValue =
				prevDataArray[upper] + (dataArray[upper] - prevDataArray[upper]) * blendFactor;
			const value = lowerValue * (1 - weight) + upperValue * weight;

			const normalizedValue = value / 255;
			const scaledLoudness = Math.pow(normalizedValue, scalingExponent);
			const barHeight = Math.max(scaledLoudness * canvas.height, 10);
			const color = normalizedValue * 255 + 150;

			if (i < bassBarCount) {
				canvasCtx.fillStyle = `rgb(${color}, 0, 0)`; // Red for bass
			} else if (i < bassBarCount + midBarCount) {
				canvasCtx.fillStyle = `rgb(0, ${color}, 0)`; // Green for mid-range
			} else {
				canvasCtx.fillStyle = `rgb(0, 0, ${color})`; // Blue for high frequencies
			}
			fillRoundRect(canvasCtx, x, (canvas.height - barHeight) / 2, barWidth, barHeight, 5);

			x += barWidth + 2;
		}

		animationId = requestAnimationFrame(draw);
	}

	$: if (howl && mediaElement) {
		if (!analyser) {
			audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
			analyser = audioContext.createAnalyser();
			analyser.fftSize = 1024 * 2;

			// Create a MediaElementAudioSourceNode from the provided mediaElement
			source = audioContext.createMediaElementSource(mediaElement);

			// Connect the source to the analyser
			source.connect(analyser);
			analyser.connect(audioContext.destination);

			bufferLength = analyser.frequencyBinCount;
			dataArray = new Uint8Array(bufferLength);
		}
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
		draw();
	}

	$: if (mediaElement) {
		if (source) {
			source.disconnect();
		}

		source = audioContext.createMediaElementSource(mediaElement);
		source.connect(analyser);
		analyser.connect(audioContext.destination);
	}
</script>

<canvas
	bind:this={canvas}
	width="1280"
	height="350"
	class="transition-opacity {ready ? 'opacity-100' : 'opacity-0'} duration-1000"
/>
