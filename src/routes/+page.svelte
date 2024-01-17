<script lang="ts">
	import AudioPlayer from '../components/AudioPlayer.svelte';
	import Visualizer from '../components/Visualizer.svelte';
	import { invMel } from '../util';
	let mediaElement: HTMLMediaElement;
	let scalingExponent = 3.3;
	let split = 75;
	let maxMel = 2850;
	$: melInterval = maxMel / split;
	let upperBounds: number[] = [];
	$: melInterval, calculateBounds();
	const calculateBounds = () => {
		const newBounds = [0];
		for (let i = 1; i <= split; i++) {
			const mel = melInterval * i;
			const freq = invMel(mel);
			newBounds.push(Math.floor(freq));
		}
		upperBounds = newBounds;
	};

	let hideUI = false;

	function handleHideUI() {
		hideUI = !hideUI;
	}
</script>

<div class="h-screen flex flex-col">
	<div class="p-3 w-min transition-opacity {hideUI ? 'opacity-0 hover:!opacity-80' : ''} z-10">
		<div class="">
			<AudioPlayer
				on:audioReady={(e) => {
					mediaElement = e.detail.mediaElement;
				}}
				on:click={handleHideUI}
			/>
		</div>
		<div>
			<input type="range" min={0} max={10} bind:value={scalingExponent} step={0.1} class="w-64" />
			<p class="text-white">scalingExponent: {scalingExponent}</p>
			<input type="range" min={6} max={100} bind:value={split} step={1} class="w-64" />
			<p class="text-white">split: {split}</p>
			<input type="range" min={300} max={3000} bind:value={maxMel} step={10} class="w-64" />
			<p class="text-white">maxMel: {maxMel}</p>
			<br />
			<p class="text-gray-200">Last update: January 16, 2024 10:17 PM EST</p>
		</div>

		<br />
	</div>
	<div class="flex justify-center h-screen w-screen items-center absolute -z-10">
		<Visualizer {mediaElement} bind:upperBounds {scalingExponent} />
	</div>
</div>
