/**
 * Where the reader stopped, per episode, so the home page can say "continue".
 *
 * It lives in `localStorage` rather than the host's plugin state for the same reason
 * the five-step ticks do: it is a fact about this browser's listening, cheap to lose,
 * and not something the agent reads. The notes file is the durable record; this is
 * only a bookmark. Everything here tolerates a cleared or hand-edited entry, because
 * a bookmark that throws would take the home page down with it.
 */

const KEY = 'dsh-lingualab:progress'

/** The most episodes remembered; the oldest bookmarks fall off first. */
const MAX_ENTRIES = 100

/** One bookmark. */
export interface Progress {
  /** Seconds into the episode where listening stopped. */
  readonly at: number
  /** The episode's length when it was last known, to draw a bar without opening it. */
  readonly duration: number
  /** Milliseconds since the epoch of the last update, which orders "recent". */
  readonly updatedAt: number
}

type Table = Readonly<Record<string, Progress>>

/** Whether a stored value is a bookmark. */
function isProgress(value: unknown): value is Progress {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return (
    typeof record.at === 'number' &&
    Number.isFinite(record.at) &&
    typeof record.duration === 'number' &&
    Number.isFinite(record.duration) &&
    typeof record.updatedAt === 'number' &&
    Number.isFinite(record.updatedAt)
  )
}

/** Read every bookmark, dropping anything that is not one. */
export function readAllProgress(): Table {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw === null) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return {}
    const table: Record<string, Progress> = {}
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (isProgress(value)) table[id] = value
    }
    return table
  } catch {
    return {}
  }
}

/** One episode's bookmark, or `null`. */
export function readProgress(episode: string): Progress | null {
  return readAllProgress()[episode] ?? null
}

/**
 * Record where listening stopped.
 *
 * Positions under a few seconds are not worth a bookmark: they are what a fresh episode
 * reports before anyone has listened, and "continue from 0:02" is noise.
 */
export function writeProgress(episode: string, at: number, duration: number, now = Date.now()): void {
  if (!Number.isFinite(at) || at < 3) return
  try {
    const table = { ...readAllProgress(), [episode]: { at, duration: Number.isFinite(duration) ? duration : 0, updatedAt: now } }
    const newest = Object.entries(table)
      .sort((left, right) => right[1].updatedAt - left[1].updatedAt)
      .slice(0, MAX_ENTRIES)
    window.localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(newest)))
  } catch {
    // Storage that is full or disabled costs the bookmark, not the session.
  }
}

/** Forget one episode's bookmark. */
export function clearProgress(episode: string): void {
  try {
    const table = { ...readAllProgress() }
    delete table[episode]
    window.localStorage.setItem(KEY, JSON.stringify(table))
  } catch {
    // Same as above.
  }
}

/** How far through an episode the bookmark is, from 0 to 1. */
export function fractionOf(progress: Progress | null): number {
  if (progress === null || progress.duration <= 0) return 0
  return Math.min(1, Math.max(0, progress.at / progress.duration))
}
