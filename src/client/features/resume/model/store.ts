/**
 * This browser's cache of the reader's progress.
 *
 * The host holds the shared copy (see `src/host/features/progress/model/progress.ts`);
 * this is what the page reads and writes synchronously, so the home page never waits on a
 * request and a closed tab loses nothing the host had not yet seen. Two keys, both whole
 * tables:
 *
 *   · `dsh-lingualab:progress` — listening position per episode, the shape this plugin has
 *     always stored, so an existing bookmark survives the upgrade;
 *   · `dsh-lingualab:steps`    — the five-step ticks per episode.
 *
 * Earlier versions kept the ticks under one key per episode (`dsh-lingualab:steps:<id>`).
 * They are folded into the table once and the old keys removed, stamped just above zero so
 * any tick made since on another device wins over them.
 *
 * Every read tolerates a cleared, full or hand-edited storage: a cache that throws would
 * take the home page down with it.
 */
import { sanitizeEpisodeSteps, sanitizeProgressTable, sanitizeStepsTable } from '../../../shared/progress.ts'
import type { ProgressTable } from '../../../shared/protocol.ts'

const PROGRESS_KEY = 'dsh-lingualab:progress'
const STEPS_KEY = 'dsh-lingualab:steps'
const LEGACY_STEPS_PREFIX = 'dsh-lingualab:steps:'

let migrated = false

/** Parse one stored value, or `null` when it is absent or not JSON. */
function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? null : (JSON.parse(raw) as unknown)
  } catch {
    return null
  }
}

/** Fold the per-episode step keys of earlier versions into the table, once per page load. */
function migrateLegacySteps(): void {
  if (migrated) return
  migrated = true
  try {
    const storage = window.localStorage
    const legacy: string[] = []
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index)
      if (key !== null && key.startsWith(LEGACY_STEPS_PREFIX) && key.length > LEGACY_STEPS_PREFIX.length) legacy.push(key)
    }
    if (legacy.length === 0) return
    const steps = { ...sanitizeStepsTable(readJson(STEPS_KEY)) }
    for (const key of legacy) {
      const episode = key.slice(LEGACY_STEPS_PREFIX.length)
      const entry = sanitizeEpisodeSteps({ updatedAt: 1, records: readJson(key) })
      if (entry !== null && steps[episode] === undefined) steps[episode] = entry
      storage.removeItem(key)
    }
    storage.setItem(STEPS_KEY, JSON.stringify(steps))
  } catch {
    // Storage that cannot be enumerated keeps its old ticks where they are; nothing is lost.
  }
}

/** Read the whole cache. */
export function readTable(): ProgressTable {
  migrateLegacySteps()
  return {
    progress: sanitizeProgressTable(readJson(PROGRESS_KEY)),
    steps: sanitizeStepsTable(readJson(STEPS_KEY)),
  }
}

/** Replace the whole cache. A full or disabled storage costs the cache, not the session. */
export function writeTable(table: ProgressTable): void {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(table.progress))
    window.localStorage.setItem(STEPS_KEY, JSON.stringify(table.steps))
  } catch {
    // Same as above.
  }
}

/** Forget that the legacy keys were folded in; for tests that reset storage between cases. */
export function resetMigrationForTests(): void {
  migrated = false
}
