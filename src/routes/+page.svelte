<script lang="ts">
	import { PlayState } from '$lib/types';
	import { onMount } from 'svelte';
	import { getMetadata, invMel } from '$lib/util';
	import { mediaElement, playing, queue, metadata } from '$lib/store';
	import MoreButton from '$lib/components/Player/MoreButton.svelte';
	import Visualizer from '$lib/components/Visualizer.svelte';
	import TitleArtist from '$lib/components/Player/TitleArtist/TitleArtist.svelte';
	import Background from '$lib/components/Background.svelte';
	import PlaybackButtons from '$lib/components/Player/PlaybackButtons/PlaybackButtons.svelte';
	import Progress from '$lib/components/Player/Progress.svelte';
	import Sound from '$lib/components/Player/Sound.svelte';
	import Cover from '$lib/components/Player/Cover.svelte';

	// let max = 35;
	// let lower = 3.3;
	// let upper = 6;
	// let stepDivisor = 1000;
	let innerWidth: number;
	let innerHeight: number;
	let split = 75;
	let maxMel = 2850;
	$: if (innerWidth < 1200) {
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

	onMount(() => {
		queue.subscribe(async (value) => {
			if (value.current >= value.tracks.length && value.tracks.length > 0) {
				// Playback has finished.
				$queue.current = 0;
				$playing = PlayState.Stopped;
				if ($mediaElement) {
					// Not quite sure why this has to be here, but it doesn't work without it.
					$mediaElement.pause();

					$mediaElement.currentTime = 0;
				}
				return;
			}

			// Ensure next 2 tracks have metadata loaded
			for (let i = value.current; i < value.current + 2; i++) {
				if (value.tracks[i] && !value.tracks[i].metadata) {
					value.tracks[i].metadata = await getMetadata(value.tracks[i].url);
				}
			}

			// Update metadata
			const currentTrack = value.tracks[value.current];
			if (!currentTrack) return;
			metadata.set(currentTrack.metadata || null);

			// Don't create a new audio element if the correct song is already loaded
			if ($mediaElement?.src !== currentTrack.url) $mediaElement = new Audio(currentTrack.url);
		});
		// Bind mediaElement to playing
		playing.subscribe((newPlaying) => {
			if (!$mediaElement) return null;

			if (newPlaying === PlayState.Playing) $mediaElement.play();
			else $mediaElement.pause();
		});
		mediaElement.subscribe((media) => {
			if (!media) return;
			media.onloadeddata = () => {
				// If the player is paused, don't autoplay the loaded song.
				if ($playing === PlayState.Stopped) return;

				$playing = PlayState.Playing;
				$mediaElement?.play();
			};

			media.onended = () => {
				if ($queue.tracks[$queue.current + 1]) {
					$queue.current += 1;
				} else $playing = PlayState.Stopped;
			};
		});
	});
</script>

<Background />
<svelte:window bind:innerWidth bind:innerHeight />
<div class="w-full h-screen flex overflow-hidden select-none">
	<!-- Left bar -->
	<div class="w-[630px] flex items-center justify-center flex-col gap-6 overflow-hidden mx-auto">
		<div class="rounded-lg my-7 w-full h-[480px] flex items-center justify-center">
			<Cover />
		</div>
		<div class="w-full flex justify-center items-center">
			<TitleArtist />
			<MoreButton />
		</div>
		<div class="w-[452px]">
			<Progress />
			<PlaybackButtons />
			<Sound />
		</div>
	</div>
	<!-- Lyrics & Vis -->
	<div
		class="h-full flex flex-col justify-center items-center font-bold flex-1 text-white {innerWidth >
		1050
			? 'block'
			: 'hidden'}"
	>
		<Visualizer bind:upperBounds sumTotal={1} />
	</div>
</div>
