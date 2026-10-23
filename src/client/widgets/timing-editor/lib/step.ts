/**
 * The rules for moving the timing panel to the sentence before or after.
 *
 * A move reopens the panel on the neighbour, so it keeps what the reader was editing: the focused
 * edge stays focused, except on a line whose end cannot move, where it falls back to the start. A
 * changed range that can be saved is written first, and the neighbour opens once the subtitles have
 * been read back; a changed range on an episode that cannot be saved has nowhere to go, so it moves
 * at once.
 */
import type { RetimeEdge, RetimeRange } from '../../../entities/cue/index.ts'

/** The sentence a step goes to, or `null` at an end of the cue list. */
export function stepTarget(index: number, direction: -1 | 1, count: number): number | null {
  const target = index + direction
  return target >= 0 && target < count ? target : null
}

/** Whether a range differs from the one the panel opened with. */
export function rangeChanged(range: RetimeRange, base: RetimeRange): boolean {
  return range.start !== base.start || range.end !== base.end
}

/** Whether a move has to save first: a changed range that can be saved is written, then moved to. */
export function stepNeedsSave(blocked: string | null, changed: boolean): boolean {
  return blocked === null && changed
}

/** The edge the neighbour opens on: the same one, unless its end cannot be moved. */
export function focusAfterStep(focus: RetimeEdge, endEditable: boolean): RetimeEdge {
  return endEditable ? focus : 'start'
}
