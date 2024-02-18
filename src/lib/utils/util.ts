// this is still installed
// import { fetchFromUrl } from 'music-metadata-browser';
import { getFlacMetadata } from '$lib/utils/metadata/getFlacMetadata';
import { extractColors } from 'extract-colors';
import { getMp3Metadata } from './metadata/getMp3Metadata';
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
	} else fetchMetadata = await getFlacMetadata(arrayBuffer);
	// else if (format === 'audio/flac') {
	// 	fetchMetadata = await getFlacMetadata(arrayBuffer);
	// }

	// else {
	// TODO default to old method of retrieval

	// }
	let colors: string[] = [];
	if (fetchMetadata.albumCoverUrl) {
		const colorsData = await extractColors(fetchMetadata.albumCoverUrl || '');
		console.log({ colorsData });
		colors = colorsData
			// .filter((e) => e.area > 0.02)
			// .sort((a, b) => b.intensity - a.intensity)
			.filter((e) => e.intensity > 0.1) // 0.2 is arbitrary
			.sort((a, b) => b.area - a.area)
			.map((c) => c.hex)
			.slice(0, 4);
	}
	const metadata: App.Metadata = {
		title: fetchMetadata.tags.TITLE || '',
		artist: artistsArrayToString(
			fetchMetadata.tags.ARTIST || '',
			fetchMetadata.tags.TITLE || '',
			commaExceptions
		),
		album: fetchMetadata.tags.ALBUM || '',
		explicit: false,
		cover: fetchMetadata.albumCoverUrl,
		colors
		// accent:
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
