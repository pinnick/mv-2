import { writable } from 'svelte/store';

export const metadata = writable<App.Metadata | null>(null);
export const mediaElement = writable<HTMLMediaElement | null>(null);
