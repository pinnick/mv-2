// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Metadata {
			title: string;
			artist: string;
			album: string;
			explicit?: boolean;
			cover: string | null;
			colors: string[];
			video?: string;
			accent: string;
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
			demo?: boolean;
		}
		interface Track {
			url: string;
			file?: File;
			type?: 'audio/flac' | 'audio/mpeg' | 'audio/mp4';
			arrayBuffer?: ArrayBuffer;
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
