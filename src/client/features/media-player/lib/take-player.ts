/**
 * Playing a take.
 *
 * A take plays through an `Audio` element of its own, never through the media element that carries the source:
 * that one stays the only timeline the sentences are on, paused at the sentence's start while the take plays.
 *
 * The take element is one shared element, made on first use and kept for the life of the page, not a new one per
 * take. That is for iOS Safari, which lets an element with sound play outside a user gesture only if that same
 * element was played inside a gesture earlier, and the hands-free program plays each take long after the last
 * touch. {@link primeTakeAudio} does that first play (a silent clip) and is called from the gestures the reader
 * makes; a take then only changes the element's `src`. Releasing a take clears the handlers, pauses the element and
 * drops its `src`, but keeps the element, which is what keeps it unlocked.
 */
import type { Take } from './take.ts'

/** The few parts of an `Audio` element this file needs. */
export interface AudioLike {
  src: string
  onended: ((event: Event) => void) | null
  onerror: ((event: Event | string) => void) | null
  play(): Promise<void> | undefined
  pause(): void
  removeAttribute(name: string): void
  load(): void
}

/** Make the audio element. */
export type AudioFactory = () => AudioLike

/** What playing a take tells whoever started it. */
export interface TakePlayHooks {
  /** The take played to its end (or stalled past its own length, which is treated the same). */
  readonly ended: () => void
  /** The browser would not play it, or could not decode it. */
  readonly failed: () => void
}

/** Time allowed beyond the take's own length before a take that never reports its end is let go. */
const END_SLACK_MS = 3000

/** Samples in the silent clip: a tenth of a second at {@link SILENT_RATE}. */
const SILENT_SAMPLES = 800
const SILENT_RATE = 8000

/** A tiny silent WAV (8-bit mono) as a data URI: just long enough to count as having played. */
export function silentWav(): string {
  const bytes = new Uint8Array(44 + SILENT_SAMPLES)
  const view = new DataView(bytes.buffer)
  const text = (at: number, value: string): void => {
    for (let i = 0; i < value.length; i += 1) bytes[at + i] = value.charCodeAt(i)
  }
  text(0, 'RIFF')
  view.setUint32(4, 36 + SILENT_SAMPLES, true)
  text(8, 'WAVE')
  text(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, SILENT_RATE, true)
  view.setUint32(28, SILENT_RATE, true)
  view.setUint16(32, 1, true)
  view.setUint16(34, 8, true)
  text(36, 'data')
  view.setUint32(40, SILENT_SAMPLES, true)
  // 8-bit PCM is unsigned: silence is the midpoint.
  bytes.fill(128, 44)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return `data:audio/wav;base64,${btoa(binary)}`
}

const browserAudio: AudioFactory = () => new Audio()

/** The shared element, once made, and whether a play inside a gesture has unlocked it. */
const holder: { make: AudioFactory; audio: AudioLike | null; primed: boolean; busy: boolean } = {
  make: browserAudio,
  audio: null,
  primed: false,
  busy: false,
}

/** The shared take element, made the first time it is asked for. */
function takeAudio(): AudioLike {
  holder.audio ??= holder.make()
  return holder.audio
}

/**
 * Replace how the take element is made, and forget the one that exists. For tests, which pass a fake; with no
 * argument the browser's `Audio` comes back.
 */
export function setTakeAudioFactory(make: AudioFactory = browserAudio): void {
  holder.make = make
  holder.audio = null
  holder.primed = false
  holder.busy = false
}

/**
 * Unlock the take element for playing without a gesture.
 *
 * Call it synchronously inside a real user gesture (a click, a key press): it makes the element, plays a silent clip
 * on it and pauses it again. It counts as done only once the browser accepted that play, so a call made outside a
 * gesture, or refused, leaves the next gesture to try again. Once unlocked it does nothing.
 */
export function primeTakeAudio(): void {
  if (holder.primed) return
  const audio = takeAudio()
  // A take already playing on the element has no need of unlocking, and must not be overwritten.
  if (holder.busy) return
  audio.src = silentWav()
  let started: Promise<void> | undefined
  try {
    started = audio.play()
  } catch {
    return
  }
  // A browser that does not return a promise has no gesture rule to unlock.
  if (started === undefined) {
    holder.primed = true
    return
  }
  started.then(
    () => {
      holder.primed = true
      // The silent clip is not a take: leave it alone if one has started on the element meanwhile.
      if (!holder.busy) audio.pause()
    },
    () => undefined,
  )
}

/**
 * Play a take once, on the shared element.
 *
 * @returns Cancel, which stops it and releases the element's source. Nothing is reported after it is called.
 */
export function playTake(take: Take, hooks: TakePlayHooks): () => void {
  const audio = takeAudio()
  let over = false
  holder.busy = true
  const release = (): void => {
    over = true
    holder.busy = false
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
  audio.src = take.url
  try {
    audio.play()?.catch(() => settle('failed'))
  } catch {
    settle('failed')
  }
  return () => {
    if (!over) release()
  }
}
