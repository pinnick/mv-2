import { writable } from 'svelte/store';
import { PlayState } from '$lib/types';

export const metadata = writable<App.Metadata | null>(null);
export const mediaElement = writable<HTMLMediaElement | null>(null);
export const queue = writable<App.Queue>({ current: 0, tracks: [] });
export const playing = writable<PlayState>(PlayState.Ready);
