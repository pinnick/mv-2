<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let mediaElement: HTMLMediaElement;
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

	async function loadSong(index: number, url: string) {
		let nextURL: string;

		if (mediaElement) URL.revokeObjectURL(mediaElement.src);
		mediaElement = new Audio(url);
		mediaElement.oncanplay = async () => {
			console.log('ready to play');
			ready = true;
			if (queue[index + 1]) nextURL = URL.createObjectURL(queue[index + 1]);

			dispatch('audioReady', {
				mediaElement,
				file: queue[index]
			});
		};

		mediaElement.onended = () => {
			if (queue[index + 1]) {
				loadSong(index + 1, nextURL);
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

<input type="file" multiple id="upload" accept="audio/*" on:change={handleFileUpload} />
<br />
<button
	class="p-2 my-2 rounded {ready ? 'bg-gray-200' : 'bg-gray-500/70 text-gray-300 cursor-default'}"
	on:click={toggle}>Play / Pause</button
>
<button class="rounded bg-gray-200 p-2" on:click>Hide UI</button>
