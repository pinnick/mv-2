// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
		interface Metadata {
			title: string;
			artist: string;
			album: string;
			explicit: booolean;
			cover: string | null;
			video?: string;
		}
		interface Properties {
			scalingExponent: number;
			logScaleFactor: number;
			linearMinFreq: number;
			linearMaxFreq: number;
			linearPercentage: number;
			bassAttenuationFactor: number;
		}
		type MovementState = -1 | 0 | 1;
	}
}

export {};
