<script lang="ts">
	import { metadata } from '$lib/store';
	import { invMel } from '../util';
	import { fade } from 'svelte/transition';
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

	let hideUI = false;

	function handleHideUI() {
		hideUI = !hideUI;
	}

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
			<div class="flex-none mr-16 w-8 ml-5">
				<div
					transition:fade
					class="rounded-full w-7 h-7 bg-gray-400/40 hover:opacity-70 flex items-center justify-center cursor-pointer"
				>
					<svg viewBox="0 0 256 256" width="20" height="20" class="text-white">
						<path
							d="M156 128a28 28 0 1 1-28-28a28 28 0 0 1 28 28ZM48 100a28 28 0 1 0 28 28a28 28 0 0 0-28-28Zm160 0a28 28 0 1 0 28 28a28 28 0 0 0-28-28Z"
							fill="currentColor"
						/>
					</svg>
				</div>
			</div>
		</div>
		<div class="xl:w-[452px]">
			<Progress bind:mediaElement />
			<Buttons bind:mediaElement on:toggle={toggle} />
			<Sound bind:mediaElement />
		</div>
	</div>
	<!-- Lyrics & Vis -->
	<div class="h-full flex flex-col justify-center items-center font-bold flex-1 text-white">
		<Visualizer {mediaElement} bind:upperBounds scalingExponent={3} sumTotal={1} />
	</div>
	<div class="absolute top-0 left-0">
		<AudioPlayer
			on:audioReady={(e) => {
				mediaElement = e.detail.mediaElement;
			}}
		/>
	</div>
</div>
