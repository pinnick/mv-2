// this is still installed
// import FastAverageColor from 'fast-average-color';
import { getFlacMetadata } from '$lib/utils/metadata/getFlacMetadata';
import { extractColors } from 'extract-colors';
import { getMp3Metadata } from '$lib/utils/metadata/getMp3Metadata';
import { getOtherMetadata } from '$lib/utils/metadata/getOtherMetadata';
import { colord } from 'colord';

export const average = (array: number[]): number => {
	return array.reduce((a, b) => a + b) / array.length;
};

export const delay = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const invMel = (m: number): number => 700 * (Math.exp(m / 1127) - 1);

export const formatTime = (seconds: number): string => {
	const flooredSeconds = Math.floor(seconds);
	const mins = Math.floor(flooredSeconds / 60);
	const secs = flooredSeconds % 60;
	return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export function sumTopXInRange(
	dataArray: Uint8Array,
	lowerIndex: number,
	upperIndex: number,
	x: number
): number {
	const topValues = Array(x).fill(0);

	for (let i = lowerIndex; i <= upperIndex; i++) {
		// If the current value is larger than the smallest of the top three values...
		if (dataArray[i] > topValues[0]) {
			// Replace the smallest value and sort the array.
			topValues[0] = dataArray[i];
			topValues.sort((a, b) => a - b);
		}
	}

	// Sum up the top three values.
	const sum = topValues.reduce((a, b) => a + b, 0);

	return sum / topValues.length;
}

export function scaleExponentially(value: number, power: number): number {
	const normalizedValue = value / 255;
	const rescaledValue = Math.pow(normalizedValue, power) * 255;
	return rescaledValue;
}

export const findDynamicScalingExponent = (
	max: number,
	lower: number,
	upper: number,
	lowerIndex: number
): number => {
	const diff = upper - lower;

	const change = (lowerIndex / max) * diff;
	const dynamic = upper - change;

	if (dynamic < lower) return lower;

	return dynamic;
};
export const stepper = (scaledValue: number, lowerIndex: number, divisor: number) => {
	const stepped = scaledValue / 255 + (lowerIndex / divisor) * (scaledValue / 255);

	if (stepped > 1) return 255;

	return stepped * 255;
};

export const spring = (t: number) => {
	return Math.pow(Math.E, -6 * t ** 2) * Math.cos(7.5 * t * t - Math.PI) + 1;
};

export const shuffle = <T>(array: T[]): T[] => {
	let currentIndex = array.length;
	let randomIndex: number;

	while (currentIndex > 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
};

const artistsArrayToString = (
	artistsStr: string,
	title: string,
	commaExceptions: string[]
): string => {
	// Tracks may have the same title as their artist. In this case, the artist would be completelely empty since it is
	// removed by the title check. This only removes artists after "feat" has been declared.
	const splitByFeat = title.toLowerCase().split('feat');
	let titleFeat = splitByFeat.length > 1 ? splitByFeat[splitByFeat.length - 1] : '';

	// Some artists like to have commas in their names. This deals with common ones.
	for (let i = 0; i < commaExceptions.length; i++) {
		const exceptionArtist = commaExceptions[i];
		const re = new RegExp(exceptionArtist, 'ig');

		artistsStr = artistsStr.replace(re, `EXCEPTION${i}`);
		titleFeat = titleFeat.replace(re, `EXCEPTION${i}`);
	}

	let artists: string[] = artistsStr.split(', ');
	let str = '';

	// Title check: Rid artists that are already in the title (ex: feat. ARTIST)
	artists = artists.filter((e) => !titleFeat.toLowerCase().includes(e.toLowerCase()));

	artists.forEach((a, i) => {
		// Place exceptions back in place for the artist
		if (a.includes('EXCEPTION')) {
			// Index is the last character
			const index = parseInt(a[a.length - 1]);
			a = commaExceptions[index];
		}

		switch (i) {
			case 0:
				str += `${a}`;
				break;
			case artists.length - 1:
				str += ` & ${a}`;
				break;
			default:
				str += `, ${a}`;
				break;
		}
	});

	return str;
};

export const getMetadata = async (
	arrayBuffer: ArrayBuffer,
	format: string
): Promise<App.Metadata> => {
	const t0 = performance.now();

	const commaExceptions = [
		'Tyler, The Creator',
		'Earth, Wind & Fire',
		'Crosby, Stills & Nash',
		'Emerson, Lake & Palmer'
	];

	let fetchMetadata: {
		tags: App.VorbisTags;
		albumCoverUrl: string | null;
	};

	if (format === 'audio/mpeg') {
		fetchMetadata = await getMp3Metadata(arrayBuffer);
	} else if (format === 'audio/flac') fetchMetadata = await getFlacMetadata(arrayBuffer);
	else {
		fetchMetadata = await getOtherMetadata(arrayBuffer);
	}

	let colors: string[] = [];
	let accent: string = '';

	if (fetchMetadata.albumCoverUrl) {
		let colorsData = await extractColors(fetchMetadata.albumCoverUrl || '', {
			hueDistance: 0.1,
			lightnessDistance: 0.05,
			saturationDistance: 0.1,
			distance: 0.1
		});
		console.log({ colorsData });

		colorsData = colorsData.filter((e) => e.area > 0.01);

		colors = colorsData
			.sort((a, b) => b.area - a.area)
			.slice(0, 4)
			.sort((a, b) => b.lightness - a.lightness)
			.map((c) => c.hex);

		console.log({ colors });

		// Mimic colors for case of small length
		if (!colors[1]) colors[1] = colord(colors[0]).saturate(0.25).darken(0.1).toHex();
		if (!colors[2]) colors[2] = colord(colors[0]).mix(colors[1]).saturate(0.1).toHex();

		accent =
			colorsData
				.filter((e) => e.saturation > 0.1)
				.filter((e) => e.intensity > 0.03)
				.sort((a, b) => b.area - a.area)[0]?.hex || colors[0];

		console.log({ accent });
	}

	const metadata: App.Metadata = {
		title: fetchMetadata.tags.TITLE || '',
		artist: artistsArrayToString(
			fetchMetadata.tags.ARTIST || '',
			fetchMetadata.tags.TITLE || '',
			commaExceptions
		),
		album: fetchMetadata.tags.ALBUM || '',
		cover: fetchMetadata.albumCoverUrl,
		colors,
		accent
	};

	const t1 = performance.now();
	const time = t1 - t0;
	console.log('done in ' + time.toFixed(0) + ' ms');

	return metadata;
};

export const getString = (dataView: DataView, offset: number, length: number): string => {
	const uint8Array = new Uint8Array(dataView.buffer, offset, length);
	const decoder = new TextDecoder('utf-8');
	const out = decoder.decode(uint8Array);
	return out;
};
