<script lang="ts">
	import Bar from './Bar.svelte';
	import { buttons } from '../constants';
	import { onDestroy } from 'svelte';
	import { mediaElement } from '$lib/store';
	let element: HTMLDivElement;
	let sound: number = 0.75;
	let barWidth: number;
	let fromLeft: number;

	$: $mediaElement, syncVolume();
	$: sound, $mediaElement && ($mediaElement.volume = sound);

	function syncVolume() {
		if ($mediaElement && sound !== $mediaElement.volume) sound = $mediaElement.volume;
	}

	function handleMouseDown(e: MouseEvent) {
		// If things are selected, weird behaviors can occur.
		document.getSelection()?.empty();

		fromLeft = e.pageX - e.offsetX;
		sound = e.offsetX / barWidth;
		document.addEventListener('mousemove', handleMouseMove);
		// document.addEventListener('mouseup', handleMouseUp);
	}
	function handleMouseMove(e: MouseEvent) {
		let soundUpdate = (e.pageX - fromLeft) / barWidth;

		const threshold = 0.01; // Only update if change is at least 1% of the full range

		if (Math.abs(soundUpdate - sound) > threshold) {
			// Bound value from 0 to 1
			soundUpdate = Math.max(soundUpdate, 0);
			soundUpdate = Math.min(soundUpdate, 1);

			sound = soundUpdate;
		}
		if (e.buttons !== 1) {
			document.removeEventListener('mousemove', handleMouseMove);
		}
	}
	onDestroy(() => {
		if (typeof document !== 'undefined') document.removeEventListener('mousemove', handleMouseMove);
	});
</script>

<div class="w-full text-white/50 flex gap-3 items-center h-9" bind:this={element}>
	<svg width="13" class="mx-[7px]" height="19" viewBox="0 0 13 19">
		<path fill="currentColor" fill-opacity=".85" d={buttons.speakerFill} />
	</svg>
	<div class="w-full" bind:clientWidth={barWidth}>
		<Bar to={1} current={sound} on:mousedown={handleMouseDown} />
	</div>
	<svg width="27" height="20" viewBox="0 0 27 20">
		<path fill="currentColor" fill-opacity=".85" d={buttons.speakerWave3} />
	</svg>
</div>
