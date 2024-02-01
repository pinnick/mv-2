<script lang="ts">
	import { metadata } from '$lib/store';
</script>

<div
	class="absolute w-full h-full flex items-center justify-center -z-10 overflow-hidden select-none"
>
	{#if $metadata?.cover}
		<img
			class="w-screen h-full transform blur-[400px] scale-125 opacity-[.55] animate-slow-spin overflow-hidden"
			src={$metadata.cover}
			alt=""
		/>
		<div class="absolute inset-0 bg-black -z-20 w-full h-full top-0 left-0" />
	{:else}
		<div
			class="absolute inset-0 bg-gradient-to-b from-neutral-500 via-neutral-500 to-neutral-700 -z-20 w-full h-full top-0 left-0"
		/>
	{/if}
</div>
