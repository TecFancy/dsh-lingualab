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
 *
 * With the microphone on, a speaking pause that was recorded is followed by a comparison before the program goes on:
 * the sentence once more, then the reader's own take. The comparison is not one of the plays; it is a step the
 * pause hands over to, and once it is done the program asks again as if the pause had just run out.
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
  /**
   * Record each speaking pause with the microphone and compare it afterwards. Only a pause can be recorded, so
   * this is never on while `pause` is `off` (see {@link mergeShadow}, which keeps the two in step).
   */
  readonly record: boolean
}

/** Today's shadowing: one play, stop, wait for the reader. */
export const DEFAULT_SHADOW: ShadowSettings = { plays: 1, pause: 'off', advance: false, record: false }

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
  /**
   * Whether the speaking pause that just ran out was recorded and its comparison has not been played yet.
   * Left out (or false) when there is nothing to compare, or once the comparison is over.
   */
  readonly compare?: boolean
}

/** What the store should do, and whether the sentence's English is uncovered while it does it. */
export type ShadowPlan =
  /** Play the sentence again from its start (with the lead-in), right away. */
  | { readonly do: 'replay'; readonly reveal: boolean }
  /** Stop at the sentence's start and wait out a pause of this kind. */
  | { readonly do: 'wait'; readonly phase: ShadowPhase; readonly reveal: boolean }
  /** Play the sentence once more, uncovered, then the reader's take; the program asks again when that is over. */
  | { readonly do: 'compare' }
  /** Go on to the next sentence and play it, covered. */
  | { readonly do: 'advance' }
  /** Stop at the sentence's start, uncovered, and wait for the reader. */
  | { readonly do: 'stop' }

/** Decide what comes after a play ends or a pause runs out. */
export function planShadow({ played, after, settings, last, compare = false }: ShadowInput): ShadowPlan {
  const pausing = settings.pause !== 'off'
  const onward = settings.advance && !last
  if (after === 'speak' && compare) return { do: 'compare' }
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
  const pause = SHADOW_PAUSES.find((offered) => offered === value.pause) ?? DEFAULT_SHADOW.pause
  return {
    plays: SHADOW_PLAYS.find((plays) => plays === value.plays) ?? DEFAULT_SHADOW.plays,
    pause,
    advance: value.advance === true,
    // Recording lives inside a speaking pause: with no pause there is nothing to record.
    record: value.record === true && pause !== 'off',
  }
}

/**
 * Change some of the settings, keeping recording and the pause consistent.
 *
 * Turning the microphone on when there is no pause sets the pause to the sentence's own length, because a reader
 * who asked to be recorded has asked for time to speak, and a switch that refuses is a dead end. Turning the
 * pause off turns the microphone off with it (the parse does that), and the switch shows it.
 */
export function mergeShadow(current: ShadowSettings, patch: Partial<ShadowSettings>): ShadowSettings {
  const raised: Partial<ShadowSettings> =
    patch.record === true && patch.pause === undefined && current.pause === 'off' ? { ...patch, pause: 'same' } : patch
  return parseShadowSettings({ ...current, ...raised })
}
