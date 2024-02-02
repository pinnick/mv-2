<script lang="ts">
	export let opacity = 1;
	let parentWidth: number;
	let childWidth: number;

	// Minus 50 to start fade slightly before it actually overflows (padding)
	$: overflow = childWidth >= parentWidth - 50;
	// A maskRight value of "100%" will eliminate the right-side gradient, and "92%" will make it visible.
	$: maskRight = overflow ? '92%' : '100%';
</script>

<div class="whitespace-nowrap w-[110%] -ml-[10%] marquee" bind:clientWidth={parentWidth}>
	<p
		class="w-min max-w-full marquee-text pl-[10%] flex gap-10"
		style="--opacity: {opacity}; --maskRight: {maskRight}"
	>
		<span bind:clientWidth={childWidth}><slot /></span>
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
