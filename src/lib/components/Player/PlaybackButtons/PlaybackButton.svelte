<script lang="ts">
	export let label: string;
	export let size = 48;
	export let viewbox = '0 0 256 256';
	export let color = 'white';
</script>

<button on:click aria-label={label} class="px-5">
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox={viewbox}
		class="outline-none hover:text-white/80 transition-colors duration-75"
		{color}
	>
		<slot />
	</svg>
</button>
