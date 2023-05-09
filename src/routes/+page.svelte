<script lang="ts">
	import AudioPlayer from '../components/AudioPlayer.svelte';
	import ComponentEditor from '../components/ComponentEditor.svelte';
	import Visualizer from '../components/Visualizer.svelte';
	import { getAudibleFrequencies } from '../util';
	import type { Howl } from 'howler';
	let howl: Howl;
	let mediaElement: HTMLMediaElement;
	let file: File;
	let frequencyBounds: { low: number; high: number } = { low: 0, high: 0 };
	let magnitudeBound: number;

	// let upperBounds = {
	// 	lb: 70,
	// 	mb: 120,
	// 	hb: 250,
	// 	lm: 500,
	// 	mm: 1000,
	// 	hm: 2000,
	// 	lt: 5000,
	// 	mt: 10000,
	// 	ht: 20000
	// };
	const upperBounds = [70, 120, 250, 500, 1000, 2000, 20000, 20000, 20000];
	let scalingExponent = 7;
	let logScaleFactor = 0.17;

	let hideUI = false;
	async function updateFrequencyBounds() {
		for (let i = 256; i <= 16384; i = i * 2) {
			const t0 = performance.now();
			const bounds = await getAudibleFrequencies(mediaElement, i);
			const t1 = performance.now();
			console.log(i, bounds, t1 - t0);
		}

		// magnitudeBound = bounds.m;
		// console.log(frequencyBounds);
	}
	function handleHideUI() {
		hideUI = !hideUI;
	}
	$: if (mediaElement) updateFrequencyBounds();
</script>

<div class="h-screen flex flex-col">
	<div class="p-3 w-min transition-opacity {hideUI ? 'opacity-0 hover:!opacity-80' : ''} z-10">
		<div class="">
			<AudioPlayer
				on:audioReady={(e) => {
					howl = e.detail.howl;
					mediaElement = e.detail.mediaElement;
					file = e.detail.file;
				}}
				on:click={handleHideUI}
			/>
		</div>
		<ComponentEditor {upperBounds} />
		<div>
			<input type="range" min={0} max={10} bind:value={scalingExponent} step={0.1} class="w-64" />
			<p class="text-white">scalingExponent: {scalingExponent}</p>
			<input
				type="range"
				min={0.1}
				max={0.25}
				bind:value={logScaleFactor}
				step={0.01}
				class="w-64"
			/>
			<p class="text-white">logScaleFactor: {logScaleFactor}</p>
		</div>
		<br />
	</div>
	<div class="flex justify-center h-screen w-screen items-center absolute -z-10">
		<Visualizer {howl} {mediaElement} {frequencyBounds} {scalingExponent} {logScaleFactor} />
	</div>
</div>
