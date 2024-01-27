/**
 * Get the metadata and picture of a FLAC file.
 * @param file The FLAC file.
 * @returns The tags and album cover. Album cover may be null.
 */
export const getFlacMetadata = async (
	file: File
): Promise<{ tags: App.VorbisTags; albumCoverUrl: string | null }> => {
	const arrayBuffer = await file.arrayBuffer();
	const dataView = new DataView(arrayBuffer);

	if (!isFlacFile(dataView)) {
		console.error('File is not a valid FLAC file.');
		return { tags: {}, albumCoverUrl: null };
	}

	let offset = 4; // Start after 'fLaC' marker
	let tags: Record<string, string> = {}; // Declare tags here
	let albumCoverUrl: string | null = null; // Declare albumCoverUrl here

	while (offset < dataView.byteLength) {
		if (offset + 4 > dataView.byteLength) {
			console.error('Unexpected end of file');
			break;
		}

		const blockHeader = getMetadataBlockHeader(dataView, offset);

		if (offset + 4 + blockHeader.blockSize > dataView.byteLength) {
			console.error('Block size exceeds file length');
			break;
		}

		switch (blockHeader.blockType) {
			case 4: // VORBIS_COMMENT
				tags = parseVorbisCommentBlock(dataView, offset + 4);
				break;
			case 6: // PICTURE
				albumCoverUrl = parsePictureBlock(dataView, offset + 4);
				break;
		}

		if (blockHeader.isLastBlock) break;

		offset += 4 + blockHeader.blockSize; // Move to next block
	}

	return { tags, albumCoverUrl };
};

const isFlacFile = (dataView: DataView): boolean => dataView.getUint32(0) === 0x664c6143;

const getMetadataBlockHeader = (
	dataView: DataView,
	offset: number
): { isLastBlock: boolean; blockType: number; blockSize: number } => {
	const header = dataView.getUint32(offset);
	return {
		isLastBlock: (header & 0x80000000) !== 0,
		blockType: (header & 0x7f000000) >> 24,
		blockSize: header & 0x00ffffff
	};
};

const parseVorbisCommentBlock = (dataView: DataView, offset: number): any => {
	// Read and skip vendor string
	const vendorLength = dataView.getUint32(offset, true); // Assuming little-endian
	offset += 4 + vendorLength; // Move past the vendor string

	// Retrieve the number of comment fields in the Vorbis Comment block
	const commentListLength = dataView.getUint32(offset, true);
	offset += 4;

	let tags: Record<string, string> = {};
	for (let i = 0; i < commentListLength; i++) {
		const commentLength = dataView.getUint32(offset, true);
		offset += 4;
		const comment = getString(dataView, offset, commentLength);
		offset += commentLength;

		const [key, value] = comment.split('=');
		tags[key] = value;
	}

	return tags;
};
const parsePictureBlock = (dataView: DataView, offset: number): string | null => {
	// Skip picture type (4 bytes)
	offset += 4;

	// Read MIME type length and data
	const mimeTypeLength = dataView.getUint32(offset, false);
	offset += 4;
	const mimeType = getString(dataView, offset, mimeTypeLength);
	offset += mimeTypeLength;

	// Skip description
	const descriptionLength = dataView.getUint32(offset, false);
	offset += 4 + descriptionLength;

	// Skip picture data attributes (width, height, bit depth, colors)
	offset += 16;

	// Read picture data length and data
	const length = dataView.getUint32(offset, false);
	if (length === 0) return null;
	offset += 4;

	if (offset + length > dataView.byteLength) {
		console.error('Picture data length exceeds data view length');
		return null;
	}
	const buffer = new Uint8Array(dataView.buffer, offset, length);
	const blob = new Blob([buffer], { type: mimeType });
	const picture = URL.createObjectURL(blob);
	return picture;
};

const getString = (dataView: DataView, offset: number, length: number): string => {
	const uint8Array = new Uint8Array(dataView.buffer, offset, length);
	const decoder = new TextDecoder('utf-8'); // Specify the encoding
	const out = decoder.decode(uint8Array);
	return out;
};
