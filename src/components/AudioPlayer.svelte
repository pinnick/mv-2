<script lang="ts">
	import { Howl } from 'howler';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let howl: Howl;
	let mediaElement: HTMLMediaElement;
	let ready = false;
	function load(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files) {
			const file = target.files[0];
			const url = URL.createObjectURL(file);
			if (howl) howl.unload();
			if (mediaElement) URL.revokeObjectURL(mediaElement.src);

			mediaElement = new Audio(url);
			howl = new Howl({
				src: [url],
				format: [file.type.split('/')[1]],
				html5: true // Ensure we're using HTML5 Audio
			});
			howl.rate;
			mediaElement.oncanplay = () => {
				ready = true;
				dispatch('audioReady', { howl, mediaElement, file });
			};
		}
	}

	function toggle() {
		if (mediaElement) {
			if (mediaElement.paused) mediaElement.play();
			else mediaElement.pause();
		}
	}
</script>

<input type="file" id="upload" accept="audio/*" on:change={load} />
<br />
<button
	class="p-2 my-2 rounded {ready ? 'bg-gray-200' : 'bg-gray-500/70 text-gray-300 cursor-default'}"
	on:click={toggle}>Play / Pause</button
>
<button class="rounded bg-gray-200 p-2" on:click>Hide UI</button>
