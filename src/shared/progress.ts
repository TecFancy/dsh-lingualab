/**
 * Where the reader stopped and which of the five steps are done, as data both halves merge.
 *
 * The host keeps one copy of this per library and every browser keeps a cache of it, so a
 * second device (or a cleared cache) picks up where the first one left off. The two copies are
 * reconciled by one rule: for each key the entry with the newest `updatedAt` wins. That is
 * deliberately not a CRDT. One person listens on one device at a time, and "the last place
 * anyone stopped" is exactly what they want to resume from.
 *
 * Everything here is total. A stored value that is not the right shape is dropped rather than
 * thrown on, because both the file on disk and a browser's storage can be hand-edited, and a
 * bookmark that throws would take the home page down with it.
 *
 * Pure data work with no `node:` imports, so the browser bundle can use it.
 */
import type { EpisodeSteps, ProgressEntry, ProgressTable, StepRecord } from './protocol.ts'

/** The most episodes whose position is remembered; the oldest bookmarks fall off first. */
export const MAX_PROGRESS_ENTRIES = 100

/** The most episodes whose step ticks are remembered. */
export const MAX_STEP_EPISODES = 200

/** The longest episode id kept as a key; a longer one is not an id this plugin made. */
const MAX_ID_LENGTH = 300

/** The most steps one episode may carry; the method has five. */
const MAX_STEPS_PER_EPISODE = 12

/** A clock a day ahead is a wrong clock; its entries are clamped so they cannot outrank every real one. */
const FUTURE_SLACK_MS = 24 * 60 * 60 * 1000

/** The empty table, for a library nobody has listened to yet. */
export const EMPTY_PROGRESS: ProgressTable = { progress: {}, steps: {} }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function isKey(value: string): boolean {
  return value.length > 0 && value.length <= MAX_ID_LENGTH
}

/** A timestamp made safe: finite, not negative, and not from the far future. */
function stamp(value: unknown, now: number): number | null {
  if (!isCount(value)) return null
  return Math.min(value, now + FUTURE_SLACK_MS)
}

/** Read one position, or `null` when it is not one. */
export function sanitizeProgressEntry(value: unknown, now = Date.now()): ProgressEntry | null {
  if (!isRecord(value)) return null
  const updatedAt = stamp(value.updatedAt, now)
  if (!isCount(value.at) || !isCount(value.duration) || updatedAt === null) return null
  return { at: value.at, duration: value.duration, updatedAt }
}

/** Read one episode's step ticks, or `null` when they are not that. */
export function sanitizeEpisodeSteps(value: unknown, now = Date.now()): EpisodeSteps | null {
  if (!isRecord(value) || !isRecord(value.records)) return null
  const updatedAt = stamp(value.updatedAt, now)
  if (updatedAt === null) return null
  const records = new Map<string, StepRecord>()
  for (const [step, raw] of Object.entries(value.records)) {
    if (records.size >= MAX_STEPS_PER_EPISODE) break
    if (step.length === 0 || step.length > 40 || !isRecord(raw)) continue
    records.set(step, {
      done: raw.done === true,
      seconds: isCount(raw.seconds) ? Math.min(raw.seconds, 10_000_000) : 0,
    })
  }
  return { updatedAt, records: Object.fromEntries(records) }
}

function newestFirst<T extends { readonly updatedAt: number }>(table: Map<string, T>, limit: number): Record<string, T> {
  return Object.fromEntries([...table].sort((left, right) => right[1].updatedAt - left[1].updatedAt).slice(0, limit))
}

/** Read a table of positions, dropping every entry that is not one. */
export function sanitizeProgressTable(input: unknown, now = Date.now()): Record<string, ProgressEntry> {
  const table = new Map<string, ProgressEntry>()
  if (isRecord(input)) {
    for (const [id, value] of Object.entries(input)) {
      const entry = isKey(id) ? sanitizeProgressEntry(value, now) : null
      if (entry !== null) table.set(id, entry)
    }
  }
  return newestFirst(table, MAX_PROGRESS_ENTRIES)
}

/** Read a table of step ticks, dropping every entry that is not one. */
export function sanitizeStepsTable(input: unknown, now = Date.now()): Record<string, EpisodeSteps> {
  const table = new Map<string, EpisodeSteps>()
  if (isRecord(input)) {
    for (const [id, value] of Object.entries(input)) {
      const entry = isKey(id) ? sanitizeEpisodeSteps(value, now) : null
      if (entry !== null) table.set(id, entry)
    }
  }
  return newestFirst(table, MAX_STEP_EPISODES)
}

/** Read a whole table, whichever half is missing or malformed. */
export function sanitizeProgress(input: unknown, now = Date.now()): ProgressTable {
  if (!isRecord(input)) return EMPTY_PROGRESS
  return { progress: sanitizeProgressTable(input.progress, now), steps: sanitizeStepsTable(input.steps, now) }
}

/** Merge two tables key by key, the newer `updatedAt` winning; a tie keeps `base`. */
function mergeNewest<T extends { readonly updatedAt: number }>(
  base: Readonly<Record<string, T>>,
  other: Readonly<Record<string, T>>,
  limit: number,
): Record<string, T> {
  const merged = new Map<string, T>(Object.entries(base))
  for (const [id, entry] of Object.entries(other)) {
    const existing = merged.get(id)
    if (existing === undefined || entry.updatedAt > existing.updatedAt) merged.set(id, entry)
  }
  return newestFirst(merged, limit)
}

/** Merge two whole tables. `base` wins ties, so merging a copy with itself changes nothing. */
export function mergeProgress(base: ProgressTable, other: ProgressTable): ProgressTable {
  return {
    progress: mergeNewest(base.progress, other.progress, MAX_PROGRESS_ENTRIES),
    steps: mergeNewest(base.steps, other.steps, MAX_STEP_EPISODES),
  }
}

/** Whether `mine` has an entry the other side lacks or holds an older version of. */
export function hasNewer(mine: ProgressTable, theirs: ProgressTable): boolean {
  for (const [id, entry] of Object.entries(mine.progress)) {
    const other = theirs.progress[id]
    if (other === undefined || entry.updatedAt > other.updatedAt) return true
  }
  for (const [id, entry] of Object.entries(mine.steps)) {
    const other = theirs.steps[id]
    if (other === undefined || entry.updatedAt > other.updatedAt) return true
  }
  return false
}

/** Whether two tables hold the same entries, whatever the key order. */
export function sameProgress(left: ProgressTable, right: ProgressTable): boolean {
  return !hasNewer(left, right) && !hasNewer(right, left)
}
