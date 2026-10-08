/**
 * The loop decision, as a pure function.
 *
 * Looping is the most-used control in the whole panel, and it is also where the
 * interesting bugs live: a wrap that fires one `timeupdate` late clips the first
 * syllable of the repeat, a wrap that fires early cuts the last one, and a
 * counter that is decremented in the wrong place either never stops or stops on
 * the first pass. Keeping the decision here means the store, the audio element
 * and the tests all agree on one rule, and the rule can be tested without a
 * browser.
 */

/** What the player is repeating right now. */
export type LoopMode = 'none' | 'sentence' | 'ab'

/** Everything the decision depends on. */
export interface LoopInput {
  /** Current playback position in seconds. */
  readonly time: number
  readonly mode: LoopMode
  /** Bounds of the sentence being played, when one is. */
  readonly cueStart: number | null
  readonly cueEnd: number | null
  readonly pointA: number | null
  readonly pointB: number | null
  /** How many times the window should play; `0` means until stopped. */
  readonly repeats: number
  /** How many complete passes have already happened. */
  readonly playsDone: number
}

/** What the caller should do about it. */
export interface LoopDecision {
  /** Seek here and keep playing, or `null` to leave the position alone. */
  readonly seekTo: number | null
  /** Stop playback: the requested number of passes is complete. */
  readonly stop: boolean
  /** The pass count to store after this decision. */
  readonly playsDone: number
}

/**
 * Only float jitter is forgiven here. The value is deliberately tiny: a generous
 * tolerance would wrap the loop before the last syllable and cut it off, which is
 * exactly the artefact this whole feature exists to avoid.
 */
const END_TOLERANCE_SECONDS = 0.01

/** The window being repeated, or `null` when nothing is. */
export function loopWindow(input: Pick<LoopInput, 'mode' | 'cueStart' | 'cueEnd' | 'pointA' | 'pointB'>): {
  start: number
  end: number
} | null {
  if (input.mode === 'sentence') {
    const { cueStart, cueEnd } = input
    if (cueStart === null || cueEnd === null || cueEnd <= cueStart) return null
    return { start: cueStart, end: cueEnd }
  }
  if (input.mode === 'ab') {
    const { pointA, pointB } = input
    if (pointA === null || pointB === null || pointB <= pointA) return null
    return { start: pointA, end: pointB }
  }
  return null
}

/** Decide whether this tick wraps, stops, or does nothing. */
export function planLoop(input: LoopInput): LoopDecision {
  const window = loopWindow(input)
  if (window === null) return { seekTo: null, stop: false, playsDone: input.playsDone }
  if (input.time < window.end - END_TOLERANCE_SECONDS) {
    return { seekTo: null, stop: false, playsDone: input.playsDone }
  }

  const playsDone = input.playsDone + 1
  if (input.repeats > 0 && playsDone >= input.repeats) {
    return { seekTo: null, stop: true, playsDone }
  }
  return { seekTo: window.start, stop: false, playsDone }
}

/** Where the player should jump when the user asks for "the previous sentence". */
export function stepCueIndex(currentIndex: number, delta: number, cueCount: number): number {
  if (cueCount === 0) return -1
  const next = currentIndex + delta
  if (next < 0) return 0
  if (next > cueCount - 1) return cueCount - 1
  return next
}
