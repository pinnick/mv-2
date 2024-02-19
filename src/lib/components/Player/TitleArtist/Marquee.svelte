<script lang="ts">
	export let opacity = 1;
	export let parentWidth: number;
	export let childWidth: number;
	export let overflowOffset = 44;
	export let offset: number;

	$: overflow = childWidth >= parentWidth - overflowOffset;

	$: marginLeft = overflow ? Math.min(offset, childWidth + overflowOffset) : 0;
	// A maskRight value of "100%" will eliminate the right-side gradient, and "92%" will make it visible.
	$: maskRight = overflow ? '92%' : '100%';
</script>

<div class="whitespace-nowrap -ml-8 marquee gap-4" bind:clientWidth={parentWidth}>
	<p
		class="w-min max-w-full marquee-text pl-9 flex"
		style="--opacity: {opacity}; --maskRight: {maskRight}; gap: {overflowOffset}px"
	>
		<span bind:clientWidth={childWidth} style="margin-left: -{marginLeft}px"><slot /></span>
		{#if overflow}
			<slot />
		{/if}
	</p>
</div>

<style>
	.marquee {
		mask-size: 100% 100%;
		mask-repeat: no-repeat;
		mask-position: left;
	}
	.marquee-text {
		mask-image: linear-gradient(
			to right,
			transparent,
			rgba(0, 0, 0, var(--opacity)) 6%,
			rgba(0, 0, 0, var(--opacity)) var(--maskRight),
			transparent
		);
	}
</style>
