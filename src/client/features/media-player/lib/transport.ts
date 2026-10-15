/**
 * The play button's one action, shared by everything that presses it.
 *
 * The transport button, the Space key and the Media Session handlers (a headset's button, the lock screen) all mean the
 * same thing by "play or pause", so what that is lives here once: unlock the take element when recording is on (this is
 * inside a gesture for the first two, and harmless for a handler, which only counts if the browser accepts it), then let
 * the store decide. The store's `toggle` already knows what a speaking pause or a comparison is, so pressing it there
 * ends the program at the sentence's start rather than skipping the rest of the pause.
 */
import { useMediaPlayer, type MediaPlayerState } from '../model/store.ts'
import { primeTakeAudio } from './take-player.ts'

/**
 * Whether a program is running, which is when the play button reads "pause": the media plays, or shadowing waits out a
 * speaking pause, or a comparison is under way.
 */
export function isRunning(state: Pick<MediaPlayerState, 'isPlaying' | 'shadowWait' | 'compare'>): boolean {
  return state.isPlaying || state.shadowWait !== null || state.compare !== null
}

/**
 * Whether a headset's or the lock screen's `play` should press the play button: when nothing runs, and also while a
 * program runs with the media paused (a speaking pause, or a take in a comparison), where iOS may send `play` because it
 * reads the paused media element, and the press means stop. Only a `play` while the media really plays is ignored.
 */
export function playPresses(state: Pick<MediaPlayerState, 'isPlaying' | 'shadowWait' | 'compare'>): boolean {
  return !isRunning(state) || !state.isPlaying
}

/** Do what the play button does. */
export function togglePlayback(): void {
  const store = useMediaPlayer.getState()
  // A reader whose recording was already on from last time may start here, and the take element has to have played
  // inside a gesture; without recording there is nothing to unlock.
  if (store.shadow.record) primeTakeAudio()
  store.toggle()
}
