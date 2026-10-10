/**
 * Where the reader stopped, per episode, so the home page can say "continue".
 *
 * Reads and writes go to this browser's cache (`store.ts`), which is synchronous so the
 * page never waits; `sync.ts` carries the cache to the host and back, which is what lets a
 * second device pick up the same place. Every write stamps `updatedAt`, and that stamp is
 * what decides a disagreement between devices: the newest stop wins.
 *
 * Everything here tolerates a cleared or hand-edited entry, because a bookmark that throws
 * would take the home page down with it.
 */
import { sanitizeProgressEntry } from '../../../shared/progress.ts'
import type { ProgressEntry } from '../../../shared/protocol.ts'
import { readTable, writeTable } from './store.ts'
import { schedulePush } from './sync.ts'

/** One bookmark. */
export type Progress = ProgressEntry

/** Read every bookmark, dropping anything that is not one. */
export function readAllProgress(): Readonly<Record<string, Progress>> {
  return readTable().progress
}

/** One episode's bookmark, or `null`. */
export function readProgress(episode: string): Progress | null {
  return readAllProgress()[episode] ?? null
}

/**
 * Record where listening stopped.
 *
 * Positions under a few seconds are not worth a bookmark: they are what a fresh episode
 * reports before anyone has listened, and "continue from 0:02" is noise. A position that
 * has not moved since the last write is not rewritten either, so a paused page does not
 * keep bumping the stamp and winning every disagreement with another device.
 */
export function writeProgress(episode: string, at: number, duration: number, now = Date.now()): void {
  if (!Number.isFinite(at) || at < 3) return
  const entry = sanitizeProgressEntry({ at, duration: Number.isFinite(duration) ? duration : 0, updatedAt: now }, now)
  if (entry === null) return
  const table = readTable()
  const existing = table.progress[episode]
  if (existing !== undefined && Math.abs(existing.at - entry.at) < 0.5) return
  writeTable({ ...table, progress: { ...table.progress, [episode]: entry } })
  schedulePush()
}

/**
 * Forget one episode's bookmark in this browser.
 *
 * The host's copy is not touched, so the next sync can bring the bookmark back: this is for
 * clearing the cache, not for deleting the reader's history.
 */
export function clearProgress(episode: string): void {
  const table = readTable()
  const progress = { ...table.progress }
  delete progress[episode]
  writeTable({ ...table, progress })
}

/** How far through an episode the bookmark is, from 0 to 1. */
export function fractionOf(progress: Progress | null): number {
  if (progress === null || progress.duration <= 0) return 0
  return Math.min(1, Math.max(0, progress.at / progress.duration))
}
