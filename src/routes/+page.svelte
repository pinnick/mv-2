<script lang="ts">
	import AudioPlayer from '../components/AudioPlayer.svelte';
	import Visualizer from '../components/Visualizer.svelte';
	import { invMel } from '../util';
	let mediaElement: HTMLMediaElement;
	let scalingExponent = 4;
	let split = 44;
	let maxMel = 1700;
	let minExponent = 0.004;
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
			<input
				type="range"
				min={0.002}
				max={0.006}
				bind:value={minExponent}
				step={0.0001}
				class="w-64"
			/>
			<p class="text-white">minExponent: {minExponent}</p>
			<input type="range" min={0} max={10} bind:value={scalingExponent} step={0.1} class="w-64" />
			<p class="text-white">scalingExponent: {scalingExponent}</p>
			<input type="range" min={6} max={100} bind:value={split} step={1} class="w-64" />
			<p class="text-white">split: {split}</p>
			<input type="range" min={300} max={3000} bind:value={maxMel} step={10} class="w-64" />
			<p class="text-white">maxMel: {maxMel}</p>
			<br />
			<p class="text-gray-200">
				It's recommended that "maxMel" is at least 33x larger than "split" to avoid equal
				frequencies assigned to multiple bars
			</p>
		</div>

		<br />
	</div>
	<div class="flex justify-center h-screen w-screen items-center absolute -z-10">
		<Visualizer {mediaElement} bind:upperBounds {scalingExponent} {minExponent} />
	</div>
</div>
