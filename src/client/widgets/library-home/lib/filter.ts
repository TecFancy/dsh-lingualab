/**
 * The episode table's filter: which episodes are in practice, not started, or done with.
 *
 * The status is the method's (see `practiceStatus`), not the audio's: an episode heard to the end but
 * with steps left is still in practice.
 */
import {
  episodeProgress,
  practiceStatus,
  type PositionTable,
  type PracticeStatus,
  type StepsTable,
} from '../../../features/resume/index.ts'
import type { EpisodeEntry } from '../../../shared/protocol.ts'

/** What the filter can show: everything, or one status. */
export type EpisodeFilter = 'all' | PracticeStatus

/** The filter's options, in the order they are drawn. */
export const FILTERS: readonly EpisodeFilter[] = ['all', 'active', 'new', 'done']

/** Where an episode stands: its ticks, and whether any place in it was stored. */
export function statusOf(entry: EpisodeEntry, progress: PositionTable, steps: StepsTable): PracticeStatus {
  return practiceStatus(steps[entry.id] ?? {}, episodeProgress(progress, entry).entry !== null)
}

/** How many episodes each option would show. */
export function filterCounts(
  entries: readonly EpisodeEntry[],
  progress: PositionTable,
  steps: StepsTable,
): Readonly<Record<EpisodeFilter, number>> {
  const counts = { all: entries.length, active: 0, new: 0, done: 0 }
  for (const entry of entries) counts[statusOf(entry, progress, steps)] += 1
  return counts
}

/** The episodes an option shows, in the order given. */
export function filterEpisodes(
  entries: readonly EpisodeEntry[],
  filter: EpisodeFilter,
  progress: PositionTable,
  steps: StepsTable,
): readonly EpisodeEntry[] {
  if (filter === 'all') return entries
  return entries.filter((entry) => statusOf(entry, progress, steps) === filter)
}
