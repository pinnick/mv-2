import { writable } from 'svelte/store';

export const metadata = writable<App.Metadata | null>(null);
export const mediaElement = writable<HTMLMediaElement | null>(null);
export const queue = writable<App.Queue>({ current: 0, tracks: [] });
export const playing = writable<boolean>(false);
