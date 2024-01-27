<script lang="ts">
	import { fade } from 'svelte/transition';
	import { shuffle } from '../../util';
	import { playing, queue } from '$lib/store';
	import { PlayState } from '$lib/types';

	let shouldShuffle = false;
	async function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files) {
			// Ensure playback is ready
			$playing = PlayState.Ready;
			// Revoke previous URLs
			for (let i = 0; i < $queue.tracks.length; i++) {
				URL.revokeObjectURL($queue.tracks[i].url);
			}
			// convert to File[]
			let files = [...target.files];
			if (shouldShuffle) files = shuffle(files);

			const newQueue: App.Queue = { current: 0, tracks: [] };

			for (const file of files) {
				const track: App.Track = { url: URL.createObjectURL(file) };
				newQueue.tracks.push(track);
			}
			$queue = newQueue;
		}
	}
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
