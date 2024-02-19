import { parseBlob } from 'music-metadata-browser';

// The only reason this isn't default behavior is because it's much slower. However, it handles file types that are not
// yet optimized.
export const getOtherMetadata = async (
	arrayBuffer: ArrayBuffer
): Promise<{ tags: App.VorbisTags; albumCoverUrl: string | null }> => {
	const tags = await parseBlob(new Blob([arrayBuffer]));
	let albumCoverUrl: string | null = null;
	if (tags?.common?.picture) {
		if (tags.common.picture[0]) {
			albumCoverUrl = bufferToDataURL(
				tags.common.picture[0].data,
				tags.common.picture[0].type || ''
			);
		}
	}

	return {
		tags: {
			TITLE: tags.common.title || '',
			ARTIST: tags.common.artist,
			ALBUM: tags.common.album || ''
		},
		albumCoverUrl
	};
};

const bufferToDataURL = (buffer: ArrayBuffer, imageType: string): string => {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;

	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}

	const base64String = window.btoa(binary);
	return `data:${imageType};base64,` + base64String;
};
