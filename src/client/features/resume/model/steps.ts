/**
 * The five-step ticks and stopwatches, per episode.
 *
 * Same cache and same sync as the listening position (see `progress.ts`): the table is read
 * and written synchronously here, and `sync.ts` shares it with the host. An episode's steps
 * are stamped as a unit, so when two devices disagree the one that touched them last wins
 * whole rather than being stitched together field by field.
 */
import { sanitizeEpisodeSteps } from '../../../shared/progress.ts'
import type { StepRecord } from '../../../shared/protocol.ts'
import { readTable, writeTable } from './store.ts'
import { schedulePush } from './sync.ts'

export type { StepRecord }

/** Every episode's step records, keyed by episode id; the home reads them all at once. */
export type StepsTable = Readonly<Record<string, Readonly<Record<string, StepRecord>>>>

/** Every episode's step records, as the home shows them. */
export function readAllSteps(): StepsTable {
  const steps = readTable().steps
  return Object.fromEntries(Object.entries(steps).map(([episode, entry]) => [episode, entry.records]))
}

/** One episode's step records, keyed by step id; empty when nothing was ticked. */
export function readSteps(episode: string): Readonly<Record<string, StepRecord>> {
  return readTable().steps[episode]?.records ?? {}
}

/** Replace one episode's step records and stamp them. */
export function writeSteps(episode: string, records: Readonly<Record<string, StepRecord>>, now = Date.now()): void {
  const entry = sanitizeEpisodeSteps({ updatedAt: now, records }, now)
  if (entry === null) return
  const table = readTable()
  writeTable({ ...table, steps: { ...table.steps, [episode]: entry } })
  schedulePush()
}
