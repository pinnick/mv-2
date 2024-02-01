// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Metadata {
			title: string;
			artist: string;
			album: string;
			explicit: booolean;
			cover: string | null;
			color: string;
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

		interface Queue {
			current: number;
			tracks: Track[];
		}
		interface Track {
			url: string;
			file: File;
			metadata?: Metadata;
		}

		type VorbisTagKeys =
			| 'ALBUM'
			| 'ALBUMARTIST'
			| 'ARTIST'
			| 'COPYRIGHT'
			| 'DATE'
			| 'DISCNUMBER'
			| 'DISCTOTAL'
			| 'ISRC'
			| 'TITLE'
			| 'TRACKNUMBER'
			| 'TRACKTOTAL'
			| 'YEAR';
		type VorbisTags = {
			[key in VorbisTagKeys]?: string;
		};
	}
}

export {};
