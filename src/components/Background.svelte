<script lang="ts">
	export let src: string | null | undefined;
</script>

<div
	class="absolute w-full h-full flex items-center justify-center -z-10 overflow-hidden select-none"
>
	{#if src}
		<img
			class="w-screen h-full transform blur-[128px] scale-125 opacity-[.4] animate-slow-spin overflow-hidden"
			{src}
			alt=""
		/>
		<div class="absolute inset-0 bg-black -z-20 w-full h-full top-0 left-0" />
	{:else}
		<div class="absolute inset-0 bg-[#111111] -z-20 w-full h-full top-0 left-0" />
	{/if}
</div>
