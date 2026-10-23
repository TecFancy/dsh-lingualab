/**
 * A neighbour's range as the timing panel's timeline draws it.
 *
 * The range is where the file has the sentence, unless the edit pushes it; then it is where the
 * push lands. An LRC line has no end of its own and runs to the next line's start, so the line
 * before follows the start being moved.
 */
import { originalRange, type Cue, type PushedNeighbour, type RetimeRange } from '../../../entities/cue/index.ts'

/**
 * One side's range for the timeline.
 * @param cues - the cue list on screen.
 * @param index - the neighbour's index, or one past an end.
 * @param side - which side of the edited sentence it is on.
 * @param pushed - the neighbours the current range pushes.
 * @param range - the range being edited.
 * @param lrc - whether the file has starts only.
 */
export function neighbour(
  cues: readonly Cue[],
  index: number,
  side: PushedNeighbour['side'],
  pushed: readonly PushedNeighbour[],
  range: RetimeRange,
  lrc: boolean,
): RetimeRange | null {
  const cue = cues[index]
  if (cue === undefined) return null
  const moved = pushed.find((entry) => entry.side === side)
  if (moved !== undefined) return moved.after
  const own = originalRange(cue)
  // An LRC line runs to the next one's start, so the one before follows the start being moved.
  if (lrc && side === 'previous') return { start: own.start, end: Math.max(own.start, range.start) }
  return own
}
