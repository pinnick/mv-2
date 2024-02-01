<script lang="ts">
	import Marquee from './Marquee2.svelte';
	import { metadata, mediaElement } from '$lib/store';

	$: title = $metadata?.title || ($mediaElement ? 'Unnamed track' : 'Not Playing');
	$: album = $metadata?.album || '';
	$: artist = $metadata?.artist || '';
	$: explicit = !!$metadata?.explicit;
	$: bottomText = artist + (showAlbum && album ? ` — ${album}` : '');
	$: console.log($metadata?.color);
	let showAlbum = false;
</script>

<div class="w-full text-[22px] flex-1 min-w-0">
	<div class="font-semibold -mb-1.5 pr-1 text-white">
		<Marquee>{title}</Marquee>
	</div>
	{#if bottomText.length > 0}
		<div
			class="text-[22px]"
			style="color: color-mix(in srgb, {$metadata?.color || '#ffffff'}, #ffffff)"
		>
			<Marquee opacity={0.8}>{artist}</Marquee>
		</div>
	{:else}
		<div class="h-8" />
	{/if}
	<!-- <Marquee
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
	{/if} -->
</div>
