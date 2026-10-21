/** What the progress bar's label says about a place on the bar: its time, the sentence there and that sentence. */
import { findActiveCue, splitCue, type Cue } from '../../../entities/cue/index.ts'

export interface ScrubPoint {
  /** Seconds. */
  readonly time: number
  /** The sentence at that time, from 0, or -1 between sentences and before the first. */
  readonly index: number
  /** Its English line, empty when there is none. */
  readonly english: string
}

/** Read a place on the bar, given as 0..1 of the episode. */
export function scrubPoint(cues: readonly Cue[], duration: number, fraction: number): ScrubPoint {
  const time = Math.min(1, Math.max(0, fraction)) * Math.max(0, duration)
  const index = findActiveCue(cues, time)
  const cue = index >= 0 ? cues[index] : undefined
  return { time, index, english: cue === undefined ? '' : splitCue(cue).english }
}
