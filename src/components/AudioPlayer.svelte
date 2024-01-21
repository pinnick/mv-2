<script lang="ts">
	import { fade } from 'svelte/transition';
	import { metadata } from '$lib/store';
	import { fetchFromUrl } from 'music-metadata-browser';
	import { artistsArrayToString, bufferToDataURL } from '../util';
	import { mediaElement } from '$lib/store';

	let ready = false;
	let queue: File[] = [];
	function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files) {
			queue = [...target.files];
			const url = URL.createObjectURL(queue[0]);

			loadSong(0, url);
		}
	}

	async function loadSong(i: number, url: string) {
		const newMetadata = await fetchFromUrl(url);
		let cover: string = '';
		if (newMetadata?.common?.picture) {
			if (newMetadata.common.picture[0]) {
				cover = bufferToDataURL(
					newMetadata.common.picture[0].data,
					newMetadata.common.picture[0].type || ''
				);
			}
		}

		metadata.set({
			title: newMetadata.common.title || '',
			artist: artistsArrayToString(newMetadata.common.artist?.split(', ') || []),
			album: newMetadata.common.album || '',
			explicit: false,
			cover: cover
		});
		let nextURL: string;

		if ($mediaElement) URL.revokeObjectURL($mediaElement.src);
		$mediaElement = new Audio(url);

		$mediaElement.oncanplay = async () => {
			ready = true;
			if (queue[i + 1]) nextURL = URL.createObjectURL(queue[i + 1]);
		};

		$mediaElement.onended = async () => {
			if (queue[i + 1]) {
				await loadSong(i + 1, nextURL);
				toggle(); // play song immediately once loaded
			}
		};
	}
	function toggle() {
		if ($mediaElement) {
			if ($mediaElement.paused) $mediaElement.play();
			else $mediaElement.pause();
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
