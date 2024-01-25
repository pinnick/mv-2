<script lang="ts">
	import { getMetadata, invMel } from '$lib/util';
	import { mediaElement, playing, queue, metadata } from '$lib/store';
	import AudioPlayer from '$lib/components/AudioPlayer.svelte';
	import Visualizer from '$lib/components/Visualizer.svelte';
	import Details from '$lib/components/TitleArtist/TitleArtist.svelte';
	import Background from '$lib/components/Background.svelte';
	import Buttons from '$lib/components/ui/Playback/Buttons.svelte';
	import Progress from '$lib/components/ui/Playback/Progress.svelte';
	import Sound from '$lib/components/ui/Playback/Sound.svelte';
	import Cover from '$lib/components/Cover.svelte';

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

	queue.subscribe(async (value) => {
		// Ensure next 10 tracks have metadata loaded
		for (let i = value.current; i < value.current + 10; i++) {
			if (value.tracks[i] && !value.tracks[i].metadata) {
				value.tracks[i].metadata = await getMetadata(value.tracks[i].url);
			}
		}

		const currentTrack = value.tracks[value.current];
		if (!currentTrack) return;
		metadata.set(currentTrack.metadata || null);

		$mediaElement = new Audio(currentTrack.url);
	});
	// Bind mediaElement to playing
	playing.subscribe((newPlaying) => {
		mediaElement.update((media) => {
			if (!media) return null;
			if (newPlaying) media.play();
			else media.pause();
			return media;
		});
	});
	mediaElement.subscribe((media) => {
		if (!media) return;
		media.oncanplay = () => {
			// if ($queue.current > 0) {
			$playing = true;
			$mediaElement?.play();
			// }
		};

		media.onended = () => {
			if ($queue.tracks[$queue.current + 1]) {
				$queue.current += 1;
			} else $playing = false;
		};
	});
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
			<Buttons />
			<Sound />
		</div>
	</div>
	<!-- Lyrics & Vis -->
	<div class="h-full flex flex-col justify-center items-center font-bold flex-1 text-white">
		<Visualizer bind:upperBounds sumTotal={1} />
	</div>
	<div class="absolute top-0 left-0" />
</div>
