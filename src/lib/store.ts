import { writable } from 'svelte/store';

export const metadata = writable<App.Metadata | null>(null);
export const mediaElement = writable<HTMLMediaElement | null>(null);
export const queue = writable<App.Queue>({ current: 0, tracks: [] });
export const playing = writable<boolean>(false);
queue.subscribe((value) => {
	const newMetadata = value.tracks[value.current]?.metadata || null;
	// Don't update metadata if it's loading the next track
	if (playing && !newMetadata) return;
	metadata.set(value.tracks[value.current]?.metadata || null);
});
