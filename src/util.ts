import FFT from 'fft.js';
interface Frequencies {
	[key: number]: number;
}
type Frequency = {
	amount: number;
	magnitude: number;
};
// export async function getFrequencyMagnitudeBounds(
// 	mediaElement: HTMLMediaElement,
// 	sections = 128,
// 	minMagnitue = 5,
// 	minLower = 40,
// 	minUpper = 1200
// ) {
// 	const { freqArray, magnitudeArray } = await getAudibleFrequencies(
// 		mediaElement,
// 		sections,
// 		minMagnitue
// 	);

// 	const { upperBound, lowerBound } = varStats(freqArray);
// 	const { upperBound: upperBoundMagnitude } = varStats(magnitudeArray);
// 	console.log(lowerBound, upperBound);
// 	const low = Math.min(lowerBound, minLower);
// 	const high = Math.max(upperBound, minUpper);
// 	return { f: { low: 20, high: 10000 }, m: upperBoundMagnitude };
// }
export async function getAudibleFrequencies(
	mediaElement: HTMLMediaElement,
	fftSize: number,
	sections = 64,
	minMagnitue = 5
) {
	// Weight this function on the magnitude (volume) [one day]
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
	const response = await fetch(mediaElement.src);
	const arrayBuffer = await response.arrayBuffer();
	const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

	const sampleRate = audioBuffer.sampleRate;
	const fft = new FFT(fftSize);
	const inputData = new Float32Array(fftSize);
	const outputData = fft.createComplexArray();

	let audibleFrequencies: Frequencies = {};
	let totalMagnitude = 0;
	// const audibleMagnitudes = [];
	for (let section = 0; section < sections; section++) {
		const sectionStart = Math.floor((audioBuffer.length / 128) * section);
		audioBuffer.copyFromChannel(inputData, 0, sectionStart);
		fft.realTransform(outputData, inputData);

		const sectionFrequencies: Frequencies = {};
		// const sectionMagnitudes: number[] = [];
		for (let i = 0; i < fftSize / 2; i++) {
			const magnitude = Math.sqrt(
				outputData[i * 2] * outputData[i * 2] + outputData[i * 2 + 1] * outputData[i * 2 + 1]
			);
			const freq = (i * sampleRate) / fftSize;

			if (magnitude > minMagnitue) {
				const lastFreq = audibleFrequencies[freq];
				sectionFrequencies[freq] = (lastFreq || 0) + magnitude;
				totalMagnitude += magnitude;
				// sectionMagnitudes.push(magnitude);
			}
		}

		audibleFrequencies = { ...audibleFrequencies, ...sectionFrequencies };
		// audibleMagnitudes.push(...sectionMagnitudes);
	}
	const length = Object.keys(audibleFrequencies).length;
	// for (let i = 0; i < length; i++) {
	// 	console.log(Object.keys(audibleFrequencies).length, i);
	// 	audibleFrequencies[i] = audibleFrequencies[i] / totalMagnitude;
	// }
	for (const property in audibleFrequencies) {
		const magnitude = audibleFrequencies[property];
		audibleFrequencies[property] = magnitude / totalMagnitude;
	}
	// console.log(Object.keys(audibleFrequencies).length);
	// const sorted = audibleFrequencies.filter((x) => x > 0).sort((a, b) => a - b);
	// return [sorted[0], sorted[sorted.length - 1]];
	return [audibleFrequencies, totalMagnitude];
	// return {
	// 	freqArray: audibleFrequencies.filter((x) => x > 0).sort((a, b) => a - b)
	// 	// magnitudeArray: audibleMagnitudes.sort((a, b) => a - b)
	// };
}
function varStats(data: number[]): { lowerBound: number; upperBound: number } {
	// const low = Math.floor(data.length * 0.05);
	const up = Math.floor(data.length * 0.95);

	return { lowerBound: data[0], upperBound: data[up] };
}

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
export function financial(x: number) {
	return parseFloat(x.toFixed(2));
}

// function bass(x: number): number {
// 	const a = 500 / 0.1;
// 	return Math.max(a * x, 0);
// }

// function mid(x: number): number {
// 	const bassUpper = 500;
// 	const midUpper = 1000;
// 	const A = 0.1;
// 	const B = 0.9;

// 	const c1 = (midUpper - bassUpper) / (Math.log(B) - Math.log(A));
// 	const c2 = bassUpper - c1 * Math.log(A);

// 	return Math.max(c1 * Math.log(x) + c2, 0);
// }

// function high(x: number): number {
// 	const midUpper = 1000;
// 	const maxFrequency = 4000;
// 	const B = 0.9;

// 	const a = (maxFrequency - midUpper) / (1 - B);
// 	return Math.max(midUpper + a * (x - B), 0);
// }
export function customMapping(x: number, logScaleFactor: number): number {
	const ranges = [
		[20, 60],
		[60, 100],
		[100, 250],
		[250, 500],
		[500, 1000],
		[1000, 2000],
		[2000, 4000],
		[4000, 8000],
		[8000, 20000]
	];

	const kneePoints = [];
	let totalRange = 0;
	for (let i = 0; i < ranges.length; i++) {
		totalRange += Math.log10(ranges[i][1]) - Math.log10(ranges[i][0]);
	}

	let currentKnee = 0;
	for (let i = 0; i < ranges.length - 1; i++) {
		currentKnee += (Math.log10(ranges[i][1]) - Math.log10(ranges[i][0])) / totalRange;
		kneePoints.push(currentKnee);
	}

	let rangeIndex = 0;
	while (rangeIndex < kneePoints.length && x > kneePoints[rangeIndex]) {
		rangeIndex++;
	}

	const t =
		rangeIndex === 0
			? x / kneePoints[0]
			: (x - kneePoints[rangeIndex - 1]) / (kneePoints[rangeIndex] - kneePoints[rangeIndex - 1]);
	const logFreq =
		Math.log10(ranges[rangeIndex][0]) +
		t * (Math.log10(ranges[rangeIndex][1]) - Math.log10(ranges[rangeIndex][0]));
	return Math.pow(10, logFreq * logScaleFactor);
}

// // function bass(x: number): number {
// // 	const a = -11111.11;
// // 	const b = 3333.33;
// // 	return a * Math.pow(x, 2) + b * x;
// // }
// // function mid(x: number): number {
// // 	const a = -4545.45;
// // 	const b = 7045.45;
// // 	const c = -704.54;
// // 	return a * Math.pow(x, 2) + b * x + c;
// // }
// // function high(x: number): number {
// // 	const a = -800000;
// // 	const b = 1600000;
// // 	const c = -780000;
// // 	return a * Math.pow(x, 2) + b * x + c;
// // }
// // export function positionToFrequency(x: number): number {
// // 	let freq: number;
// // 	if (x < 0.15) freq = bass(x);
// // 	else if (x > 0.85) freq = high(x);
// // 	else freq = mid(x);
// // 	return freq;
// // }
