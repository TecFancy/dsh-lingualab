/**
 * Playing a take.
 *
 * A take plays through its own short-lived `Audio` element, never through the media element that carries the
 * source: that one stays the only timeline the sentences are on, paused at the sentence's start while the take
 * plays. The element is released as soon as the take is over or cancelled.
 */
import type { Take } from './take.ts'

/** The few parts of an `Audio` element this file needs. */
export interface AudioLike {
  onended: ((event: Event) => void) | null
  onerror: ((event: Event | string) => void) | null
  play(): Promise<void> | undefined
  pause(): void
  removeAttribute(name: string): void
  load(): void
}

/** Make an audio element for a URL. */
export type AudioFactory = (url: string) => AudioLike

/** What playing a take tells whoever started it. */
export interface TakePlayHooks {
  /** The take played to its end (or stalled past its own length, which is treated the same). */
  readonly ended: () => void
  /** The browser would not play it, or could not decode it. */
  readonly failed: () => void
}

/** Time allowed beyond the take's own length before a take that never reports its end is let go. */
const END_SLACK_MS = 3000

const browserAudio: AudioFactory = (url) => new Audio(url)

/**
 * Play a take once.
 *
 * @returns Cancel, which stops it and releases the element. Nothing is reported after it is called.
 */
export function playTake(take: Take, hooks: TakePlayHooks, make: AudioFactory = browserAudio): () => void {
  const audio = make(take.url)
  let over = false
  const release = (): void => {
    over = true
    clearTimeout(timer)
    audio.onended = null
    audio.onerror = null
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
  }
  const settle = (how: keyof TakePlayHooks): void => {
    if (over) return
    release()
    hooks[how]()
  }
  audio.onended = () => settle('ended')
  audio.onerror = () => settle('failed')
  const timer = setTimeout(() => settle('ended'), take.ms + END_SLACK_MS)
  try {
    audio.play()?.catch(() => settle('failed'))
  } catch {
    settle('failed')
  }
  return () => {
    if (!over) release()
  }
}
