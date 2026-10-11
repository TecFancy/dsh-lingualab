/**
 * What the stored positions say about an episode cut into segments.
 *
 * A segment's position is kept under its own key (see `segmentKey`), so "how far through the
 * episode" is a question about several entries. These are the answers the home and the page
 * ask: which segments are finished, which one to continue, and what to show on the card. All
 * of it is pure data work over the table of positions, so it is tested without a browser.
 */
import { segmentKey, segmentProgress } from '../../../shared/progress.ts'
import type { ProgressEntry } from '../../../shared/protocol.ts'
import { fractionOf } from '../model/progress.ts'

/** A segment counts as finished when its stored position is this close to its end. */
export const FINISHED_WITHIN_SECONDS = 1

/** The table of positions, as `readAllProgress` hands it out. */
export type PositionTable = Readonly<Record<string, ProgressEntry>>

/** The part of an episode these functions need: its id and its segments' ids. */
export interface SegmentedEpisode {
  readonly id: string
  readonly segments: readonly { readonly id: string }[]
}

/**
 * The key one thing's position is stored under: the episode id, or the segment's key.
 * @param episode - the episode id.
 * @param segment - the segment id, or `null` for an episode without segments.
 */
export function progressKeyOf(episode: string, segment: string | null): string {
  return segment === null ? episode : segmentKey(episode, segment)
}

/** Whether a position is at the end: its length is known and the position is within a second of it. */
export function isFinished(entry: ProgressEntry | null | undefined): boolean {
  if (entry === null || entry === undefined || entry.duration <= 0) return false
  return entry.at >= entry.duration - FINISHED_WITHIN_SECONDS
}

/** The stored position of each segment of an episode, in segment order; `undefined` where there is none. */
function positionsOf(progress: PositionTable, episode: SegmentedEpisode): (ProgressEntry | undefined)[] {
  const ids = episode.segments.map((segment) => segment.id)
  return ids.map((id) => segmentProgress(progress, episode.id, id, ids))
}

/** The ids of the segments that are finished. */
export function finishedSegments(progress: PositionTable, episode: SegmentedEpisode): ReadonlySet<string> {
  const positions = positionsOf(progress, episode)
  const finished = new Set<string>()
  for (const [index, segment] of episode.segments.entries()) {
    if (isFinished(positions[index])) finished.add(segment.id)
  }
  return finished
}

/**
 * The segment listened to most recently: the one whose position was stored last.
 * @returns its id, or `null` when none of the segments has a position yet.
 */
export function newestSegment(progress: PositionTable, episode: SegmentedEpisode): string | null {
  const positions = positionsOf(progress, episode)
  let best: string | null = null
  let bestStamp = -1
  for (const [index, segment] of episode.segments.entries()) {
    const stamp = positions[index]?.updatedAt
    // Strictly newer, so a tie keeps the earlier segment, which is where a person would start.
    if (stamp !== undefined && stamp > bestStamp) {
      best = segment.id
      bestStamp = stamp
    }
  }
  return best
}

/**
 * The segment 「继续练习」 opens.
 *
 * The newest one while it is still in progress. Once it was heard to the end, continuing
 * means the next segment that is not finished, after it first and then from the top; a
 * finished segment opened again only starts over, which is "再听一遍", not "继续". When
 * every segment is finished the newest one is reopened.
 * @returns the id, or `null` for an episode without segments.
 */
export function continueSegment(progress: PositionTable, episode: SegmentedEpisode): string | null {
  const newest = newestSegment(progress, episode)
  if (newest === null) return episode.segments[0]?.id ?? null
  const finished = finishedSegments(progress, episode)
  if (!finished.has(newest)) return newest
  const at = episode.segments.findIndex((segment) => segment.id === newest)
  const ordered = [...episode.segments.slice(at + 1), ...episode.segments.slice(0, at)]
  return ordered.find((segment) => !finished.has(segment.id))?.id ?? newest
}

/** What the home card shows about one episode's progress. */
export interface EpisodeProgress {
  /** The position to show: the episode's own, or the newest segment's. `null` when there is none. */
  readonly entry: ProgressEntry | null
  /** The segment that position is in, or `null` for an episode without segments. */
  readonly segment: string | null
  /** The segment 「继续练习」 opens (see {@link continueSegment}); `null` without segments. */
  readonly next: string | null
  /** Segments finished, and segments in all; both 0 for an episode without segments. */
  readonly finished: number
  readonly total: number
  /**
   * How far through, from 0 to 1, for the bar on the card: the position for an episode without
   * segments, and for one with segments the finished segments plus the part of the one in
   * progress, out of all of them.
   */
  readonly fraction: number
}

/**
 * Sum up an episode's stored progress for the home.
 * @param progress - the table of positions.
 * @param episode - the episode, with its segments if it has any.
 */
export function episodeProgress(progress: PositionTable, episode: SegmentedEpisode): EpisodeProgress {
  if (episode.segments.length === 0) {
    const entry = progress[episode.id] ?? null
    return { entry, segment: null, next: null, finished: 0, total: 0, fraction: fractionOf(entry) }
  }
  const newest = newestSegment(progress, episode)
  const ids = episode.segments.map((segment) => segment.id)
  const entry = newest === null ? null : (segmentProgress(progress, episode.id, newest, ids) ?? null)
  const finished = finishedSegments(progress, episode).size
  const total = episode.segments.length
  // The newest segment is counted once: as finished, or as the part of it that was heard.
  const partial = entry === null || isFinished(entry) ? 0 : fractionOf(entry)
  return {
    entry,
    segment: newest,
    next: continueSegment(progress, episode),
    finished,
    total,
    fraction: Math.min(1, (finished + partial) / total),
  }
}
