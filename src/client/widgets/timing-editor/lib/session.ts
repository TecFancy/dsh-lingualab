/**
 * The open timing panel's session, from the state the strip holds.
 *
 * This is the render-time derivation of everything the panel draws: the sentence and its edges, the
 * neighbours as the range pushes them, whether a step can go each way, and the limits for the edge
 * under the keys. It is here, apart from the hook, so that the hook only wires it and the rules stay
 * testable without React.
 */
import {
  initialRange,
  pushedNeighbours,
  retimeLimits,
  type Cue,
  type RetimeEdge,
  type RetimeRange,
} from '../../../entities/cue/index.ts'
import type { TimingSession } from '../model/types.ts'
import { neighbour } from './neighbours.ts'
import { stepTarget } from './step.ts'

/**
 * Build the session, or `null` when the index is not a sentence of this list.
 * @param index - the sentence being edited.
 * @param range - its edges as they stand.
 * @param focus - the edge the keys move.
 * @param cues - the list the session was opened on.
 * @param lrc - whether the file has starts only.
 * @param durationMs - the audio's length in milliseconds, or `null` when not known yet.
 */
export function timingSession(
  index: number,
  range: RetimeRange,
  focus: RetimeEdge,
  cues: readonly Cue[],
  lrc: boolean,
  durationMs: number | null,
): TimingSession | null {
  const cue = cues[index]
  if (cue === undefined) return null
  const base = initialRange(cue)
  const pushed = pushedNeighbours(cues, index, range, lrc)
  return {
    index,
    cue,
    range,
    base,
    canStepPrevious: stepTarget(index, -1, cues.length) !== null,
    canStepNext: stepTarget(index, 1, cues.length) !== null,
    focus,
    limits: retimeLimits(cues, index, lrc, durationMs),
    lrc,
    pushed,
    previous: neighbour(cues, index - 1, 'previous', pushed, range, lrc),
    next: neighbour(cues, index + 1, 'next', pushed, range, lrc),
  }
}
