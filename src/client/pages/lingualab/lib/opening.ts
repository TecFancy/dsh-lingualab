/**
 * Which episode, segment and second an open lands on, apart from React.
 *
 * Opening is where the page turns the reader's positions into a place to start: the host opens whatever it is told,
 * because it knows no more than the progress file, and the page has the reader's positions to hand. The rules (which
 * segment 「继续」 opens, where a segment resumes, whether a kept sentence is in the segment on screen) are plain
 * functions, tested without a library or a player; `useOpening.ts` is the hook that does the opening with them.
 */
import { findSegment } from '../../../features/library/index.ts'
import {
  continueSegment,
  type PositionTable,
  type Progress,
} from '../../../features/resume/index.ts'
import { segmentProgress } from '../../../shared/progress.ts'
import type { EpisodeEntry, EpisodeSegment, NotePhrase } from '../../../shared/protocol.ts'

/** The segment 「继续」 opens for an episode: the one listened to most recently, or the first; `null` without segments. */
export function segmentToContinue(entry: EpisodeEntry | null, positions: PositionTable): string | null {
  return entry === null || entry.segments.length === 0 ? null : continueSegment(positions, entry)
}

/**
 * Where an episode that was just opened starts, in seconds, or `null` when it starts at the top.
 *
 * With segments it is the opened segment's own position (the first segment also reads the position the episode had
 * before it was cut into segments); without, the episode's own stored one, which is why that is read separately and
 * handed in as `own`.
 * @param chosen - the segment that was opened, or `null` for an episode without segments.
 * @param own - the episode's own stored position (read when there are no segments).
 */
export function startPosition(
  id: string,
  chosen: string | null,
  segmentIds: readonly string[],
  positions: PositionTable,
  own: Progress | null,
): number | null {
  if (chosen === null) return own?.at ?? null
  return segmentProgress(positions, id, chosen, segmentIds)?.at ?? null
}

/**
 * The segment of a review item to open with its episode, or `undefined` to let the host pick the first.
 *
 * An item names the segment it was kept in; one the episode no longer has (the file was renamed) is not opened, so
 * the review lands on the episode instead of failing on a segment that is gone.
 */
export function segmentForItem(entry: EpisodeEntry | null, wanted: string | undefined): string | undefined {
  return wanted !== undefined && entry !== null && findSegment(entry.segments, wanted) !== null ? wanted : undefined
}

/**
 * The segment a replayed kept sentence needs opened first, or `null` when it is replayed where it is.
 *
 * The sentence names its segment; when that is not the one on screen and the episode still has it, that segment is
 * opened. A segment the episode no longer has cannot be opened, so the sentence is replayed at its second in the one
 * on screen rather than doing nothing; so is a sentence of an episode without segments.
 */
export function otherSegmentToOpen(
  phrase: Pick<NotePhrase, 'segment'>,
  openSegmentId: string | null,
  segments: readonly EpisodeSegment[],
): string | null {
  const wanted = phrase.segment
  return wanted !== undefined && wanted !== openSegmentId && findSegment(segments, wanted) !== null ? wanted : null
}
