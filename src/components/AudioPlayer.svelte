<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { get_tags } from '$lib/pkg/analyzer';
	import { metadata } from '$lib/store';
	import { fetchFromUrl } from 'music-metadata-browser';
	import { bufferToDataURL } from '../util';
	const dispatch = createEventDispatcher();

	let mediaElement: HTMLMediaElement;
	let ready = false;
	let queue: File[] = [];
	function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files) {
			queue = [...target.files];
			const url = URL.createObjectURL(queue[0]);

			const reader = new FileReader();
			reader.onload = (e) => {
				const buffer = e?.target?.result;
				if (!buffer) {
					console.log('cant find');
					return;
				}
			};
			reader.readAsArrayBuffer(queue[0]);

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
		console.log(cover);
		metadata.set({
			title: newMetadata.common.title || '',
			artist: newMetadata.common.artist || '',
			album: newMetadata.common.album || '',
			explicit: true,
			cover: cover
		});
		console.log(newMetadata);
		let nextURL: string;

		if (mediaElement) URL.revokeObjectURL(mediaElement.src);
		mediaElement = new Audio(url);

		mediaElement.oncanplay = async () => {
			ready = true;
			if (queue[i + 1]) nextURL = URL.createObjectURL(queue[i + 1]);

			dispatch('audioReady', {
				mediaElement,
				file: queue[i]
			});
		};

		mediaElement.onended = () => {
			if (queue[i + 1]) {
				loadSong(i + 1, nextURL);
				toggle(); // play song immediately once loaded
			}
		};
	}
	function toggle() {
		if (mediaElement) {
			if (mediaElement.paused) mediaElement.play();
			else mediaElement.pause();
		}
	}
</script>

<input
	type="file"
	multiple
	id="upload"
	accept="audio/*"
	on:change={handleFileUpload}
	class="text-white/0"
/>
