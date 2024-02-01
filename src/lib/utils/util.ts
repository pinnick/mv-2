import { fetchFromUrl } from 'music-metadata-browser';
import { FastAverageColor } from 'fast-average-color';
import { getFlacMetadata } from '$lib/utils/metadata/getFlacMetadata';
export const invMel = (m: number): number => 700 * (Math.exp(m / 1127) - 1);
export const rapScale = (x: number): number => (x <= 83 ? (1000 / 35) * x : Math.pow(1.099, x));
export function fillRoundRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number
) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.arcTo(x + width, y, x + width, y + radius, radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
	ctx.lineTo(x + radius, y + height);
	ctx.arcTo(x, y + height, x, y + height - radius, radius);
	ctx.lineTo(x, y + radius);
	ctx.arcTo(x, y, x + radius, y, radius);
	ctx.closePath();
	ctx.fill();
}
export function pseudoMelToHz(pseudoMel: number, midShift: number): number {
	// This exponent value controls the balance between linear and logarithmic scaling
	const exponent = 0.6;
	// Mid-shift adjustment
	const adjustedMel = pseudoMel + midShift * pseudoMel;
	return 700 * (Math.pow(10, Math.pow(adjustedMel / 2595, exponent)) - 1);
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const formatTime = (seconds: number): string => {
	const flooredSeconds = Math.floor(seconds);
	const mins = Math.floor(flooredSeconds / 60);
	const secs = flooredSeconds % 60;
	return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};
export function getMaxInRange(
	dataArray: Uint8Array,
	lowerIndex: number,
	upperIndex: number
): number {
	let maxValue = 0;
	for (let i = lowerIndex; i <= upperIndex; i++) {
		if (dataArray[i] > maxValue) {
			maxValue = dataArray[i];
		}
	}
	return maxValue;
}

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

export function isEmpty(arr: unknown[]) {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i]) return false;
	}
	return true;
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
export const bufferToDataURL = (buffer: ArrayBuffer, imageType: string): string => {
	let binary = '';
	let bytes = new Uint8Array(buffer);
	let len = bytes.byteLength;

	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}

	let base64String = window.btoa(binary);
	return `data:${imageType};base64,` + base64String;
};
export const artistsArrayToString = (
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

export const getMetadata = async (file: File): Promise<App.Metadata> => {
	const t0 = performance.now();
	const commaExceptions = [
		'Tyler, The Creator',
		'Earth, Wind & Fire',
		'Crosby, Stills & Nash',
		'Emerson, Lake & Palmer'
	];
	let metadata: App.Metadata;
	// only works for FLAC files as of now.
	const newMetadata = await getFlacMetadata(file);

	const fac = new FastAverageColor();
	let color = '#ffffff';
	// Fetch dominant color
	if (newMetadata.albumCoverUrl) {
		await fac
			.getColorAsync(newMetadata.albumCoverUrl)
			.then((albumCoverColor) => {
				color = albumCoverColor.hex;
				console.log(color);
				const t1 = performance.now();
				console.log(t1 - t0);
			})
			.catch((e) => {
				console.log(e);
			});
	}
	metadata = {
		title: newMetadata.tags.TITLE || '',
		artist: artistsArrayToString(
			newMetadata.tags.ARTIST || '',
			newMetadata.tags.TITLE || '',
			commaExceptions
		),
		album: newMetadata.tags.ALBUM || '',
		explicit: false,
		cover: newMetadata.albumCoverUrl,
		color
	};

	return metadata;
};

export const getString = (dataView: DataView, offset: number, length: number): string => {
	const uint8Array = new Uint8Array(dataView.buffer, offset, length);
	const decoder = new TextDecoder('utf-8');
	const out = decoder.decode(uint8Array);
	return out;
};