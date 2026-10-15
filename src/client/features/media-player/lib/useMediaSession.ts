/**
 * Wiring the Media Session to the player while the practice view is open.
 *
 * The session is taken when the view opens and let go when it closes (going home, or the page unmounting), so the
 * panel holds the headset's buttons exactly as long as there is a sentence to step through. There is no setting for it:
 * without handlers the browser would play or pause the media element behind the store's back, which is worse.
 *
 * Play and pause are guarded by whether a program is running, not simply toggled, because a headset can send `play`
 * while the browser believes the media is paused (a speaking pause is paused media, and the session says "playing"
 * through it) and a toggle would then stop the program the reader meant to start. Each one still does what the play
 * button does, through {@link togglePlayback}. What previous and next do is the page's: it knows whether a review is
 * running and the keys mean something else there, so it passes the mapping in.
 */
import { useEffect, useRef } from 'react'
import { useMediaPlayer } from '../model/store.ts'
import { openSession, type SessionControl, type SessionMetadata } from './media-session.ts'
import { isRunning, togglePlayback } from './transport.ts'

/** What previous track and next track do. */
export interface SessionSteps {
  readonly onPrevious: () => void
  readonly onNext: () => void
}

/**
 * Hold the headset's and the lock screen's buttons while `enabled`.
 *
 * @param enabled Whether the practice view is open.
 * @param steps What previous and next do; the latest ones are used, so they may change every render.
 * @param metadata What the lock screen names, or `null` for nothing.
 */
export function useMediaSession(enabled: boolean, steps: SessionSteps, metadata: SessionMetadata | null): void {
  const control = useRef<SessionControl | null>(null)
  const latest = useRef(steps)
  useEffect(() => {
    latest.current = steps
  })

  // The session itself: handlers while enabled, and the playback state kept in step with the store.
  useEffect(() => {
    if (!enabled) return
    const opened = openSession({
      play: () => {
        if (!isRunning(useMediaPlayer.getState())) togglePlayback()
      },
      pause: () => {
        if (isRunning(useMediaPlayer.getState())) togglePlayback()
      },
      previous: () => latest.current.onPrevious(),
      next: () => latest.current.onNext(),
    })
    control.current = opened
    const sync = (): void => opened.setPlaying(isRunning(useMediaPlayer.getState()))
    sync()
    const unsubscribe = useMediaPlayer.subscribe(sync)
    return () => {
      unsubscribe()
      opened.release()
      control.current = null
    }
  }, [enabled])

  // The metadata is a new object only when a word of it changed, so this runs when the sentence or the episode does.
  const title = metadata?.title
  const artist = metadata?.artist
  const album = metadata?.album
  useEffect(() => {
    if (!enabled) return
    control.current?.setMetadata(title === undefined ? null : { title, artist: artist ?? '', album: album ?? '' })
  }, [enabled, title, artist, album])
}
