<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fillRoundRect } from '../util';

	export let mediaElement: HTMLMediaElement;
	export let upperBounds: number[];
	export let scalingExponent: number;
	export let minExponent: number;
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
	// TODO: Set ready when music is analyzed for volume.
	$: ready = mediaElement;
	$: barCount = upperBounds.length - 1;
	let prevDataArray = bufferLength ? new Uint8Array(bufferLength) : [];
	let lastUpdateTime = performance.now();

	function draw() {
		if (!analyser) return;
		const refreshRate = 60;
		const elapsedTime = performance.now() - lastUpdateTime;
		const blendFactor = Math.min(elapsedTime / (1000 / refreshRate), 1); // For handling animation delays

		if (elapsedTime > 1000 / refreshRate) {
			prevDataArray = new Uint8Array(dataArray);
			analyser.getByteFrequencyData(dataArray);
			lastUpdateTime = performance.now();
		}

		canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

		const barWidth = 9;
		let x = 0;
		// console.log(dataArray);
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

			let totalPower = 0;
			let countedBins = 0;
			const totalBins = upperIndex - lowerIndex + 1;

			for (let j = lowerIndex; j <= upperIndex; j++) {
				const power = dataArray[j];
				if (power > 100 - Math.sqrt(barCount * totalBins)) {
					totalPower += power;
					countedBins++;
				}
			}
			// If averagePower resolves to NaN, set to 0
			const averagePower = totalPower / countedBins || 0;

			// Convert the linear amplitude value to decibels.
			const dBValue = 20 * Math.log10(Math.max(averagePower, 1) / 255);

			// Convert the dB value back to a linear amplitude value. This will create a perceived
			// volume effect where a larger change is needed at higher volumes to achieve the same
			// perceived difference in volume (as human hearing is logarithmic, not linear).
			const scaledValue = Math.pow(10, dBValue / 20);

			// Increase the apparent difference in volume between bars by raising the
			// normalized value to a power. A common choice is 2 for a quadratic difference,
			// but the scalingExponent can be any positive number.
			const scaledLoudness = Math.pow(scaledValue, scalingExponent);
			// console.log(scaledLoudness);
			// Calculate the height of the bar. It's either the scaled loudness multiplied by
			// the height of the canvas or a minimum value of 10, whichever is larger.

			const barHeight = Math.max(scaledLoudness * canvas.height, 10);

			// Calculate the color value based on the normalized value. It will be dim for low volumes and pure white for higher volumes.
			const color = scaledValue * 255 + 150;

			// Set the color for the bar.
			canvasCtx.fillStyle = `rgb(${color}, ${color}, ${color})`;

			// Draw the bar on the canvas.
			fillRoundRect(canvasCtx, x, (canvas.height - barHeight) / 2, barWidth, barHeight, 5);

			// Increment the x position for the next bar.
			x += barWidth + 2;
		}

		animationId = requestAnimationFrame(draw);
	}

	$: if (ready) {
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
	width={11 * barCount}
	height="350"
	class="transition-opacity {ready ? 'opacity-100' : 'opacity-0'} duration-1000"
/>
