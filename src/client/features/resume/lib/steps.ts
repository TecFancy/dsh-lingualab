/**
 * The study method's five steps, and what an episode's ticks say about them.
 *
 * The definitions live here rather than in the step tracker because two widgets read them: the
 * tracker, which ticks them while an episode is open, and the home, which shows where each episode
 * stands without opening it. Widgets may not read each other, so the shared part sits one layer down.
 */
import type { StepRecord } from '../../../shared/protocol.ts'

export interface StepDefinition {
  readonly id: string
  readonly labelKey: string
  /** One line on how to spend the step; only the steps done on this page have one. */
  readonly tipKey?: string
  readonly minutes: number
  /** False for the two steps that happen in the conversation, not on this page. */
  readonly inSession: boolean
}

/** The method's five steps, in order. */
export const STEPS: readonly StepDefinition[] = [
  { id: 'blind', labelKey: 'stepBlind', tipKey: 'stepTipBlind', minutes: 22, inSession: true },
  { id: 'read', labelKey: 'stepRead', tipKey: 'stepTipRead', minutes: 22, inSession: true },
  { id: 'shadow', labelKey: 'stepShadow', tipKey: 'stepTipShadow', minutes: 10, inSession: true },
  { id: 'next-day', labelKey: 'stepNextDay', minutes: 3, inSession: false },
  { id: 'weekly', labelKey: 'stepWeekly', minutes: 15, inSession: false },
]

/** One episode's ticks, keyed by step id. */
export type StepRecords = Readonly<Record<string, StepRecord>>

/** `0:19`, `22:04`: a step's clock, seconds as minutes and seconds. */
export function stepClock(seconds: number): string {
  return `${String(Math.floor(seconds / 60))}:${String(seconds % 60).padStart(2, '0')}`
}

/** How full a step's bar is, in percent: all of it once done, else the clock against the suggested time. */
export function stepFill(step: StepDefinition, record: StepRecord): number {
  if (record.done) return 100
  if (!step.inSession) return 0
  return Math.min(100, (record.seconds / (step.minutes * 60)) * 100)
}

/** How many of the five steps are ticked. Ids that are not one of the five are not counted. */
export function stepsDone(records: StepRecords): number {
  return STEPS.filter((step) => records[step.id]?.done === true).length
}

/** The first step not ticked yet, in order; `null` once all five are. */
export function currentStep(records: StepRecords): StepDefinition | null {
  return STEPS.find((step) => records[step.id]?.done !== true) ?? null
}

/** How one of the five small bars is drawn: ticked, the step being done now, or still to come. */
export type StepBar = 'done' | 'now' | 'todo'

/** The five small bars, in order; `now` is the step to mark as the one being done, or `null` for none. */
export function stepBars(records: StepRecords, now: string | null): readonly StepBar[] {
  return STEPS.map((step) => (records[step.id]?.done === true ? 'done' : step.id === now ? 'now' : 'todo'))
}

/** Where an episode stands in the method, as the home's filter sorts it. */
export type PracticeStatus = 'new' | 'active' | 'done'

/**
 * `done` once all five steps are ticked; `new` while nothing was ticked, timed or listened to;
 * `active` for everything in between. Hearing an episode to its end does not make it `done`:
 * the method is what is being finished, not the audio.
 */
export function practiceStatus(records: StepRecords, heard: boolean): PracticeStatus {
  if (stepsDone(records) === STEPS.length) return 'done'
  const touched = STEPS.some((step) => {
    const record = records[step.id]
    return record !== undefined && (record.done || record.seconds > 0)
  })
  return touched || heard ? 'active' : 'new'
}
