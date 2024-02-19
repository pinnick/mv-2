<script lang="ts">
	import Marquee from '$lib/components/Player/TitleArtist/Marquee.svelte';
	import { metadata, mediaElement, queue } from '$lib/store';
	import { delay } from '$lib/utils/util';

	$: title = $metadata?.title || ($mediaElement ? 'Unnamed track' : 'Not Playing');
	$: artist = $metadata?.artist || '';

	let explicit = false;
	let interval: NodeJS.Timeout | null;

	let offset: number = 0;

	let m1Parent: number;
	let m2Parent: number;

	let m1Child: number;
	let m2Child: number;

	const overflowOffset = 44;

	$: m1Overflow = m1Child >= m1Parent - overflowOffset;
	$: m2Overflow = m2Child >= m2Parent - overflowOffset;

	// Only alter "offset" if either top or bottom text is overflowing
	$: shouldMove = m1Overflow || m2Overflow;

	const resetMarquee = () => {
		if (interval) clearInterval(interval);
		interval = null;
		offset = 0;
	};

	const startMarquee = async () => {
		await delay(3000);

		if (!interval && shouldMove)
			interval = setInterval(() => {
				offset += 1;
			}, 28);
	};

	// Reset marquee on song/queue changes
	$: if ($queue) {
		resetMarquee();
		if (shouldMove) startMarquee();
	}

	$: if (interval && offset > Math.max(m1Child, m2Child) + overflowOffset) {
		resetMarquee();
		startMarquee();
	}
</script>

<div class="w-full text-[22px] flex-1 min-w-0">
	<!-- <MarqueeController /> -->
	<div class="font-semibold -mb-1.5 pr-1 text-white">
		<Marquee bind:parentWidth={m1Parent} bind:childWidth={m1Child} bind:offset>
			<button on:click={() => (explicit = !explicit)} class="flex items-center justify-center">
				{title}
				{#if explicit}
					<span class="ml-1.5 mt-0.5">
						<svg width={18} height={18} viewBox="3 3 18 18">
							<path
								fill="color-mix(in srgb, {$metadata?.accent || '#fff'} 30%, #ccc)"
								d={'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 6h-3v2h3c.55 0 1 .45 1 1s-.45 1-1 1h-3v2h3c.55 0 1 .45 1 1s-.45 1-1 1h-4c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1h4c.55 0 1 .45 1 1s-.45 1-1 1z'}
							/>
						</svg>
					</span>
				{/if}
			</button>
		</Marquee>
	</div>
	{#if artist.length > 0}
		<div
			class="text-[22px]"
			style="color: color-mix(in srgb, {$metadata?.accent || '#fff'} 20%, #fff)"
		>
			<Marquee bind:parentWidth={m2Parent} opacity={0.8} bind:childWidth={m2Child} bind:offset
				>{artist}</Marquee
			>
		</div>
	{:else}
		<div class="h-8" />
	{/if}
</div>
