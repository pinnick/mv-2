<script lang="ts">
	import Button from '../Button.svelte';
	import { playing, queue } from '$lib/store';

	const updatePlay = () => {
		$playing = !$playing;
	};
	const rewind = () => {
		if ($queue.current > 0) $queue.current -= 1;
	};
	const skip = () => {
		const nextTrackExists = $queue.tracks[$queue.current + 1];
		if (nextTrackExists) $queue.current += 1;
		else {
			$queue.current = 0;
			$playing = false;
		}
	};
</script>

<div class="w-full flex items-center justify-evenly py-14">
	<Button label="Rewind" viewbox="0 0 16 16" on:click={rewind}>
		<g fill="currentColor"
			><path
				d="M8.404 7.304a.802.802 0 0 0 0 1.392l6.363 3.692c.52.302 1.233-.043 1.233-.696V4.308c0-.653-.713-.998-1.233-.696L8.404 7.304Z"
			/><path
				d="M.404 7.304a.802.802 0 0 0 0 1.392l6.363 3.692c.52.302 1.233-.043 1.233-.696V4.308c0-.653-.713-.998-1.233-.696L.404 7.304Z"
			/></g
		>
	</Button>
	{#if $playing}
		<Button label="Pause" on:click={updatePlay}>
			<path
				fill="currentColor"
				d="M216 48v160a16 16 0 0 1-16 16h-40a16 16 0 0 1-16-16V48a16 16 0 0 1 16-16h40a16 16 0 0 1 16 16ZM96 32H56a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h40a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16Z"
			/></Button
		>
	{:else}
		<Button label="Play" on:click={updatePlay}
			><path
				fill="currentColor"
				d="M240 128a15.74 15.74 0 0 1-7.6 13.51L88.32 229.65a16 16 0 0 1-16.2.3A15.86 15.86 0 0 1 64 216.13V39.87a15.86 15.86 0 0 1 8.12-13.82a16 16 0 0 1 16.2.3l144.08 88.14A15.74 15.74 0 0 1 240 128Z"
			/></Button
		>
	{/if}
	<Button label="Fast Forward" viewbox="0 0 16 16" on:click={skip}>
		<g fill="currentColor"
			><path
				d="M7.596 7.304a.802.802 0 0 1 0 1.392l-6.363 3.692C.713 12.69 0 12.345 0 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692Z"
			/><path
				d="M15.596 7.304a.802.802 0 0 1 0 1.392l-6.363 3.692C8.713 12.69 8 12.345 8 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692Z"
			/></g
		></Button
	>
</div>
