<script lang="ts">
	import Marquee from './Marquee2.svelte';
	import { metadata, mediaElement } from '$lib/store';

	$: title = $metadata?.title || ($mediaElement ? 'Unnamed track' : 'Not Playing');
	$: album = $metadata?.album || '';
	$: artist = $metadata?.artist || '';
	// $: explicit = !!$metadata?.explicit;
	$: bottomText = artist + (showAlbum && album ? ` — ${album}` : '');
	let showAlbum = false;

	let explicit = false;
	const path =
		'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 6h-3v2h3c.55 0 1 .45 1 1s-.45 1-1 1h-3v2h3c.55 0 1 .45 1 1s-.45 1-1 1h-4c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1h4c.55 0 1 .45 1 1s-.45 1-1 1z';

	const toggleExplicit = () => {
		explicit = !explicit;
	};
</script>

<div class="w-full text-[22px] flex-1 min-w-0">
	<div class="font-semibold -mb-1.5 pr-1 text-white">
		<Marquee
			><button on:click={toggleExplicit} class="flex items-center justify-center">
				{title}
				{#if explicit}
					<span class="ml-1.5 mt-0.5">
						<svg width={18} height={18} viewBox="3 3 18 18"
							><path
								fill="color-mix(in srgb, {$metadata?.color || '#fff'} 30%, #999)"
								d={path}
							/></svg
						>
					</span>
				{/if}
			</button>
		</Marquee>
	</div>
	{#if bottomText.length > 0}
		<div class="text-[22px]" style="color: color-mix(in srgb, {$metadata?.color || '#fff'}, #fff)">
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
