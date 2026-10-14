/**
 * The shadowing program, as a pure function.
 *
 * A repeater's basic program is "each sentence twice, a pause to say it after each, then the next". Shadowing
 * does that one sentence at a time: it decides what happens when a play of the sentence ends and when a pause
 * runs out, and the store only applies the answer. With the defaults (one play, no pause, no auto-advance) it
 * is the stop-and-rewind shadowing has always been.
 *
 * The English stays covered through the first play and the pause after it, which is the one blind attempt,
 * and is uncovered from the second play on. With one play it is uncovered when that pause ends; with
 * auto-advance it then stays on screen for one more pause (the look), so it is read before the next sentence
 * covers it again.
 */

/** How many times each sentence plays. */
export const SHADOW_PLAYS: readonly ShadowPlays[] = [1, 2, 3]

export type ShadowPlays = 1 | 2 | 3

/** The speaking pause after each play: none, as long as the sentence, or one and a half times it. */
export const SHADOW_PAUSES: readonly ShadowPause[] = ['off', 'same', 'long']

export type ShadowPause = 'off' | 'same' | 'long'

/** What the reader sets up in the 「更多」 menu. */
export interface ShadowSettings {
  readonly plays: ShadowPlays
  readonly pause: ShadowPause
  /** Go on to the next sentence by itself once this one is done. */
  readonly advance: boolean
}

/** Today's shadowing: one play, stop, wait for the reader. */
export const DEFAULT_SHADOW: ShadowSettings = { plays: 1, pause: 'off', advance: false }

/** What a pause is for: saying the sentence, or reading it once it is uncovered before the next one. */
export type ShadowPhase = 'speak' | 'look'

/** The moment the program is asked about. */
export interface ShadowInput {
  /** Plays of this sentence finished, counting one that just ended. */
  readonly played: number
  /** The pause that just ran out, or `null` when a play just ended. */
  readonly after: ShadowPhase | null
  readonly settings: ShadowSettings
  /** Whether this is the last sentence, which has no next one to go on to. */
  readonly last: boolean
}

/** What the store should do, and whether the sentence's English is uncovered while it does it. */
export type ShadowPlan =
  /** Play the sentence again from its start (with the lead-in), right away. */
  | { readonly do: 'replay'; readonly reveal: boolean }
  /** Stop at the sentence's start and wait out a pause of this kind. */
  | { readonly do: 'wait'; readonly phase: ShadowPhase; readonly reveal: boolean }
  /** Go on to the next sentence and play it, covered. */
  | { readonly do: 'advance' }
  /** Stop at the sentence's start, uncovered, and wait for the reader. */
  | { readonly do: 'stop' }

/** Decide what comes after a play ends or a pause runs out. */
export function planShadow({ played, after, settings, last }: ShadowInput): ShadowPlan {
  const pausing = settings.pause !== 'off'
  const onward = settings.advance && !last
  if (after === null && pausing) return { do: 'wait', phase: 'speak', reveal: played >= 2 }
  // A play ended with no pause to wait, or the speaking pause ran out: the same moment.
  if (after !== 'look') {
    if (played < settings.plays) return { do: 'replay', reveal: true }
    if (!onward) return { do: 'stop' }
    // One play and a pause: the English was covered until now, so it is read for one pause before moving on.
    if (settings.plays === 1 && pausing) return { do: 'wait', phase: 'look', reveal: true }
    return { do: 'advance' }
  }
  return onward ? { do: 'advance' } : { do: 'stop' }
}

/** A second added to every pause: the moment it takes to start speaking. */
const PAUSE_START_S = 1

/**
 * How long a pause lasts, in milliseconds.
 *
 * @param seconds The sentence's length in the source.
 * @param speed The playback speed: a sentence heard at half speed is said about as slowly, so it gets twice as long.
 * @param pause The setting; `off` is no pause at all.
 */
export function shadowPauseMs(seconds: number, speed: number, pause: ShadowPause): number {
  if (pause === 'off') return 0
  const heard = Math.max(0, seconds) / (speed > 0 ? speed : 1)
  return Math.round(((pause === 'long' ? 1.5 : 1) * heard + PAUSE_START_S) * 1000)
}

/** Read stored settings back, keeping only values that are offered. */
export function parseShadowSettings(raw: unknown): ShadowSettings {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_SHADOW
  const value = raw as Record<string, unknown>
  return {
    plays: SHADOW_PLAYS.find((plays) => plays === value.plays) ?? DEFAULT_SHADOW.plays,
    pause: SHADOW_PAUSES.find((pause) => pause === value.pause) ?? DEFAULT_SHADOW.pause,
    advance: value.advance === true,
  }
}
