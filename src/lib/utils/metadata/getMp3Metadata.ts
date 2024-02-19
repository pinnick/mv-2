import { getString } from '$lib/utils/util';

export const getMp3Metadata = async (
	arrayBuffer: ArrayBuffer
): Promise<{ tags: Record<string, string>; albumCoverUrl: string | null }> => {
	const dataView = new DataView(arrayBuffer);
	const tags: Record<string, string> = {};
	let albumCoverUrl: string | null = null;

	if (!isId3v2Tag(dataView)) {
		console.error('File does not contain ID3v2 tags.');
		return { tags, albumCoverUrl };
	}

	let offset = 10; // Skip the ID3 header

	while (offset < dataView.byteLength) {
		const frameId = getString(dataView, offset, 4);
		const frameSize = dataView.getUint32(offset + 4, false);

		if (frameSize === 0) break; // Padding reached or no more frames

		const frameDataOffset = offset + 10;
		const frameDataEnd = frameDataOffset + frameSize;

		if (frameDataEnd > dataView.byteLength) {
			console.error('Frame size exceeds file length');
			break;
		}

		if (frameId === 'APIC') {
			// Album cover image
			const mimeType = 'image/jpeg';
			const descriptionEnd =
				frameDataOffset +
				mimeType.length +
				2 +
				getString(dataView, frameDataOffset + mimeType.length + 2, frameSize).indexOf('\0');
			const imageData = new Uint8Array(
				dataView.buffer,
				descriptionEnd + 1,
				frameDataEnd - descriptionEnd - 1
			);
			const blob = new Blob([imageData], { type: mimeType });
			albumCoverUrl = URL.createObjectURL(blob);
		} else if (frameId[0] === 'T') {
			const encoding = dataView.getUint8(frameDataOffset);
			const decoder = getTextDecoder(encoding);
			const text = decoder.decode(
				new DataView(dataView.buffer, frameDataOffset + 1, frameSize - 1)
			);
			tags[frameId] = text.replace(/\0/g, ''); // Remove any null characters
		}

		offset += 10 + frameSize;
	}
	const vorbisTags: App.VorbisTags = {
		ALBUM: tags.TALB,
		TITLE: tags.TIT2,
		ARTIST: tags.TPE1
	};
	return { tags: vorbisTags, albumCoverUrl };
};

const isId3v2Tag = (dataView: DataView): boolean => {
	return getString(dataView, 0, 3) === 'ID3';
};

const getTextDecoder = (encoding: number): TextDecoder => {
	switch (encoding) {
		case 0:
			return new TextDecoder('iso-8859-1');
		case 1:
			return new TextDecoder('utf-16');
		case 2:
			return new TextDecoder('utf-16be');
		case 3:
			return new TextDecoder('utf-8');
		default:
			return new TextDecoder('iso-8859-1');
	}
};
