<script lang="ts">
	export let label: string;
	export let size = 48;
	export let viewbox = '0 0 256 256';
	export let color = 'white';
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox={viewbox}
	aria-label={label}
	class="outline-none hover:text-white/80 transition-colors duration-75"
	on:click
	on:keydown
	tabindex="0"
	{color}
	role="button"
>
	<slot />
</svg>
