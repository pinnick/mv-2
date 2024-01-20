<script lang="ts">
	import { metadata } from '$lib/store';
	import { invMel } from '../util';
	import AudioPlayer from '../components/AudioPlayer.svelte';
	import Visualizer from '../components/Visualizer.svelte';
	import Details from '../components/Details/Details.svelte';
	import Background from '../components/Background.svelte';
	import Buttons from '../components/Buttons.svelte';
	import Progress from '../components/Progress.svelte';
	import Sound from '../components/Sound.svelte';
	import Cover from '../components/Cover.svelte';
	// let max = 35;
	// let lower = 3.3;
	// let upper = 6;
	// let stepDivisor = 1000;

	let mediaElement: HTMLMediaElement;
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

	function toggle() {
		if (mediaElement) {
			if (mediaElement.paused) {
				mediaElement.play();
			} else {
				mediaElement.pause();
			}
		}
	}
</script>

<Background src={$metadata?.cover} />

<div class="w-full h-screen flex overflow-hidden select-none">
	<!-- Left bar -->
	<div
		class="xl:w-[630px] w-[400px] flex items-center justify-center px-20 flex-col gap-6 overflow-hidden my-6"
	>
		<div class="rounded-lg my-7 w-full relative">
			<Cover src={$metadata?.cover} video={$metadata?.video} />
		</div>
		<div class="w-[600px] flex justify-center items-center">
			<Details />
			<!-- More button -->
			<AudioPlayer
				on:audioReady={(e) => {
					mediaElement = e.detail.mediaElement;
				}}
			/>
		</div>
		<div class="xl:w-[452px]">
			<Progress bind:mediaElement />
			<Buttons bind:mediaElement on:toggle={toggle} />
			<Sound bind:mediaElement />
		</div>
	</div>
	<!-- Lyrics & Vis -->
	<div class="h-full flex flex-col justify-center items-center font-bold flex-1 text-white">
		<Visualizer {mediaElement} bind:upperBounds sumTotal={1} />
	</div>
	<div class="absolute top-0 left-0" />
</div>
