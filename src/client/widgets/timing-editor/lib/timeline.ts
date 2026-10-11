/**
 * The geometry of the timing panel's mini timeline, as pure functions.
 *
 * The track shows a window of the audio: from the start of the sentence before to the end of the
 * sentence after, so the reader sees the gaps the edges are being moved into. With no neighbour on
 * a side the window reaches {@link EDGE_PAD_MS} past the range instead, enough to see the edge
 * move. Everything is in milliseconds, the unit the editor works in, and the result is percentages
 * of the track, clamped, which is what the blocks are laid out with.
 */
import type { RetimeRange } from '../../../entities/cue/index.ts'

/** How far the window reaches past the range where there is no neighbour to bound it. */
export const EDGE_PAD_MS = 1500

/** The window the track covers. */
export interface TimelineWindow {
  readonly from: number
  readonly to: number
}

/** A block's place on the track, in percent of its width. */
export interface TimelineBlock {
  readonly left: number
  readonly width: number
}

/**
 * The window for a range and its neighbours.
 * @param range - the range being edited.
 * @param previous - the sentence before it, where it lands, or `null`.
 * @param next - the sentence after it, where it lands, or `null`.
 */
export function timelineWindow(
  range: RetimeRange,
  previous: RetimeRange | null,
  next: RetimeRange | null,
): TimelineWindow {
  // The range always sits inside the window, also when a file's cues overlap and a neighbour's
  // edge is on the wrong side of it.
  const from = Math.min(previous?.start ?? range.start - EDGE_PAD_MS, range.start)
  const to = Math.max(next?.end ?? range.end + EDGE_PAD_MS, range.end)
  return { from: Math.max(0, from), to: Math.max(to, Math.max(0, from) + 1) }
}

/** Where a time falls on the track, in percent, held to the track. */
export function percentAt(ms: number, bounds: TimelineWindow): number {
  const span = bounds.to - bounds.from
  return Math.min(100, Math.max(0, ((ms - bounds.from) / span) * 100))
}

/** A range as a block on the track. */
export function blockOf(range: RetimeRange, bounds: TimelineWindow): TimelineBlock {
  const left = percentAt(range.start, bounds)
  return { left, width: Math.max(0, percentAt(range.end, bounds) - left) }
}
