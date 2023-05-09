<script lang="ts">
	// export let upperBounds: {
	// 	lb: number;
	// 	mb: number;
	// 	hb: number;
	// 	lm: number;
	// 	mm: number;
	// 	hm: number;
	// 	lt: number;
	// 	mt: number;
	// 	ht: number;
	// };
	export let upperBounds: number[];
	const lowerBound = 0;
	// $: total =
	// 	upperBounds.lb +
	// 	upperBounds.mb +
	// 	upperBounds.hb +
	// 	upperBounds.lm +
	// 	upperBounds.mm +
	// 	upperBounds.hm +
	// 	upperBounds.lt +
	// 	upperBounds.mt +
	// 	upperBounds.ht;
	const bounds = [
		'Low-Bass',
		'Mid-Bass',
		'High-Bass',
		'Low-Mid',
		'Mid-Mid',
		'High-Mid',
		'Low-Treble',
		'Mid-Treble',
		'High-Treble'
	];
	const ranges = ['Bass Range', 'Mid Range', 'Treble Range'];
</script>

<div class="text-white">
	<div class="grid grid-cols-9 w-[800px] gap-1 mt-5">
		{#each bounds as bound, i}
			<div class="bg-green-500/90 h-7 flex justify-center items-center relative">
				<p class="text-sm">{bound}</p>
				<div class="absolute -right-6 -top-6 w-11 text-center"><p>{upperBounds[i]}</p></div>
			</div>
		{/each}
		{#each ranges as range}
			<div class="bg-blue-500/90 col-span-3 h-6 p-0 flex justify-center items-center">
				<p class="text-sm">{range}</p>
			</div>
		{/each}
	</div>
	<br />
	<!-- Total: {total} -->
	<br />
	<br />
</div>
