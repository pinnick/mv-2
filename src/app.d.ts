// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
		interface Properties {
			scalingExponent: number;
			logScaleFactor: number;
			linearMinFreq: number;
			linearMaxFreq: number;
			linearPercentage: number;
			bassAttenuationFactor: number;
		}
	}
}

export {};
