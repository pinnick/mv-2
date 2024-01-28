<script lang="ts">
	import Marquee from './Marquee.svelte';
	import { metadata, mediaElement } from '$lib/store';
	import { onDestroy } from 'svelte';

	$: title = $metadata?.title || ($mediaElement ? 'Unnamed track' : 'Not Playing');
	$: album = $metadata?.album || '';
	$: artist = $metadata?.artist || '';
	$: explicit = !!$metadata?.explicit;
	$: bottomText = artist + (showAlbum && album ? ` — ${album}` : '');

	let showAlbum = false;
	let movement = 0;
	let interval: NodeJS.Timeout;
	let state: App.MovementState[] = [-1, -1]; // -1: Too small to move, 0: Actively moving, 1: Finished moving
	let begunMoving: number;
	// If all elements of an array are equal to 1, ignoring the ones that are equal to -1, set all values that are equal to 1 back to 0.
	function beginMovement() {
		begunMoving = Date.now();
		interval = setInterval(() => {
			if (Date.now() - begunMoving >= 3000) movement -= 1;
		}, 28);
	}
	function reset() {
		state = state.map((val) => (val === 1 ? 0 : val)); // Set all enabled back to 0
		clearInterval(interval);
		movement = 0;
		beginMovement();
	}
	onDestroy(() => {
		if (interval) clearInterval(interval);
	});
	function updateState(i: number, newValue: App.MovementState) {
		state[i] = newValue;
		state = state;
	}

	// Reset on song change
	metadata.subscribe(reset);
	// Reset when one finishes AND none are moving.
	$: {
		if (!state.includes(0) && state.includes(1)) {
			reset();
		}
	}
</script>

<div class="w-full -ml-4">
	<Marquee
		text={title}
		{explicit}
		bold
		bind:movement
		on:updateState={({ detail: newValue }) => updateState(0, newValue)}
	/>
	{#if bottomText}
		<Marquee
			text={bottomText}
			bind:movement
			on:updateState={({ detail: newValue }) => updateState(1, newValue)}
		/>
	{:else}
		<div class="h-7" />
	{/if}
</div>
