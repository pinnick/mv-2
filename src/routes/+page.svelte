<script lang="ts">
	import { metadata } from '$lib/store';
	import { invMel } from '$lib/util';
	import { mediaElement } from '$lib/store';
	import AudioPlayer from '$lib/components/AudioPlayer.svelte';
	import Visualizer from '$lib/components/Visualizer.svelte';
	import Details from '$lib/components/TitleArtist/TitleArtist.svelte';
	import Background from '$lib/components/Background.svelte';
	import Buttons from '$lib/components/ui/Playback/Buttons.svelte';
	import Progress from '$lib/components/ui/Playback/Progress.svelte';
	import Sound from '$lib/components/ui/Playback/Sound.svelte';
	import Cover from '$lib/components/Cover.svelte';
	// TODO: centralize the audio state.

	// let max = 35;
	// let lower = 3.3;
	// let upper = 6;
	// let stepDivisor = 1000;
	let innerWidth: number;
	let split = 75;
	let maxMel = 2850;
	$: if (innerWidth < 1050) {
		split = 15;
	} else if (innerWidth < 1200) {
		split = 30;
	} else if (innerWidth < 1350) {
		split = 45;
	} else if (innerWidth < 1500) {
		split = 60;
	} else {
		split = 75;
	}
	$: melInterval = maxMel / split;
	let upperBounds: number[] = [];
	$: calculateBounds(melInterval);

	const calculateBounds = (interval: number) => {
		const newBounds = [0];
		for (let i = 1; i <= split; i++) {
			const mel = interval * i;
			const freq = invMel(mel);
			newBounds.push(Math.floor(freq));
		}
		upperBounds = newBounds;
	};

	function toggle() {
		if ($mediaElement) {
			if ($mediaElement.paused) {
				if ($mediaElement.ended) $mediaElement.currentTime = 0;
				// Hack to remove setInterval bug
				else $mediaElement.currentTime = Math.floor($mediaElement.currentTime * 100) / 100;
				$mediaElement.play();
				$mediaElement = $mediaElement;
			} else {
				$mediaElement.pause();
				$mediaElement = $mediaElement;
			}
		}
	}
</script>

<Background />
<svelte:window bind:innerWidth />
<div class="w-full h-screen flex overflow-hidden select-none">
	<!-- Left bar -->
	<div class="w-[630px] flex items-center justify-center flex-col gap-6 overflow-hidden my-6">
		<div class="rounded-lg my-7 w-full h-[480px] flex items-center justify-center">
			<Cover />
		</div>
		<div class="w-full flex justify-center items-center">
			<Details />
			<!-- More button -->
			<AudioPlayer />
		</div>
		<div class="w-[452px]">
			<Progress />
			<Buttons on:toggle={toggle} />
			<Sound />
		</div>
	</div>
	<!-- Lyrics & Vis -->
	<div class="h-full flex flex-col justify-center items-center font-bold flex-1 text-white">
		<Visualizer bind:upperBounds sumTotal={1} />
	</div>
	<div class="absolute top-0 left-0" />
</div>
