<script lang="ts">
	import { fade } from 'svelte/transition';
	import { playing } from '$lib/store';
	import { artistsArrayToString, bufferToDataURL, getMetadata, shuffle } from '../util';
	import { mediaElement, queue } from '$lib/store';

	let shouldShuffle = false;
	async function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files) {
			// convert to File[]
			let files = [...target.files];
			if (shouldShuffle) files = shuffle(files);

			const newQueue: App.Queue = { current: 0, tracks: [] };

			for (let i = 0; i < files.length; i++) {
				const track: App.Track = { url: URL.createObjectURL(files[i]) };
				if (i < 5) track.metadata = await getMetadata(track.url);
				newQueue.tracks.push(track);
			}
			$queue = newQueue;
			playNext();
		}
	}

	const playNext = async () => {
		if ($queue.tracks.length > 0) {
			const url = $queue.tracks[$queue.current].url;

			if ($mediaElement) URL.revokeObjectURL($mediaElement.src);
			$mediaElement = new Audio(url);

			$mediaElement.oncanplay = async () => {
				$mediaElement?.play();
				$playing = true;
				$mediaElement = $mediaElement;
			};

			$mediaElement.onended = async () => {
				$mediaElement = $mediaElement;
				if ($queue.tracks[$queue.current + 1]) {
					$queue.current += 1;
					playNext();
				} else $playing = false;
			};

			// Ensure next 5 tracks have metadata loaded
			for (let i = $queue.current; i < $queue.current + 5; i++) {
				if ($queue.tracks[i] && !$queue.tracks[i].metadata) {
					$queue.tracks[i].metadata = await getMetadata($queue.tracks[i].url);
				}
			}
		}
	};
</script>

<div class="flex-none mr-16 w-8 ml-5">
	<!-- Three dots button -->
	<label
		for="file-upload"
		transition:fade|global
		class="rounded-full w-7 h-7 bg-gray-400/25 hover:opacity-70 flex items-center justify-center cursor-pointer"
	>
		<svg viewBox="0 0 256 256" width="20" height="20" class="text-white">
			<path
				d="M156 128a28 28 0 1 1-28-28a28 28 0 0 1 28 28ZM48 100a28 28 0 1 0 28 28a28 28 0 0 0-28-28Zm160 0a28 28 0 1 0 28 28a28 28 0 0 0-28-28Z"
				fill="currentColor"
			/>
		</svg>
	</label>
	<input
		type="file"
		multiple
		accept="audio/*"
		on:change={handleFileUpload}
		class="hidden"
		id="file-upload"
	/>
</div>
