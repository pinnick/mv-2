<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';

	export let opacity = 1;
	// export let movement: number;
	let parentWidth: number;
	let childWidth: number;

	$: overflow = childWidth >= parentWidth;
	// A maskRight value of "100%" will eliminate the right-side gradient, and "92%" will make it visible.
	$: maskRight = overflow ? '92%' : '100%';
</script>

<div class="w-[110%] -ml-[10%] marquee text-white" bind:clientWidth={parentWidth}>
	<p
		class="whitespace-nowrap w-min max-w-full marquee-text pl-[10%]"
		style="--opacity: {opacity}; --maskRight: {maskRight}"
		bind:clientWidth={childWidth}
	>
		<slot />
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
