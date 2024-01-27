export enum PlayState {
	Stopped = 'stopped', // User has paused
	Playing = 'playing', // User has begun playback
	Ready = 'ready' // User just imported files and player is waiting to play the first track in queue
}
