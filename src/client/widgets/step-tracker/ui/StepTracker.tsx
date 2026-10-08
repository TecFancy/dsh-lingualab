/**
 * The five steps of the study method, with a clock that only counts while you
 * say so.
 *
 * The method is a timed ritual — blind watch, subtitle read, shadowing, next-day
 * review, weekly review — and the reason the earlier standalone app went unused
 * was that nothing in it knew which step you were on. This card answers that one
 * question. It does not enforce anything: no alarms, no locks, no scolding. Ticks
 * and elapsed seconds are per episode and live in `localStorage`, because they are
 * progress through today's material rather than part of the notes file the agent
 * reads.
 */
import { useCallback, useEffect, useState } from 'react'
import type { Translate } from '../../../context.ts'

interface StepDefinition {
  readonly id: string
  readonly labelKey: string
  readonly minutes: number
  /** False for the two steps that happen in the conversation, not on this page. */
  readonly inSession: boolean
}

/** The method's five steps, in order. */
export const STEPS: readonly StepDefinition[] = [
  { id: 'blind', labelKey: 'stepBlind', minutes: 22, inSession: true },
  { id: 'read', labelKey: 'stepRead', minutes: 22, inSession: true },
  { id: 'shadow', labelKey: 'stepShadow', minutes: 10, inSession: true },
  { id: 'next-day', labelKey: 'stepNextDay', minutes: 3, inSession: false },
  { id: 'weekly', labelKey: 'stepWeekly', minutes: 15, inSession: false },
]

/** One step's stored progress. */
interface StepRecord {
  readonly done: boolean
  readonly seconds: number
}

type StepRecords = Readonly<Record<string, StepRecord>>

const EMPTY: StepRecord = { done: false, seconds: 0 }

/** Where one episode's step progress lives. */
function storageKey(episode: string): string {
  return `dsh-lingualab:steps:${episode}`
}

/** Read the stored progress, tolerating a cleared or corrupted entry. */
function readRecords(episode: string): StepRecords {
  try {
    const raw = window.localStorage.getItem(storageKey(episode))
    if (raw === null) return {}
    const parsed: unknown = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? (parsed as StepRecords) : {}
  } catch {
    return {}
  }
}

export interface StepTrackerProps {
  readonly t: Translate
  readonly episode: string
}

/** The five-step card. */
export function StepTracker({ t, episode }: StepTrackerProps) {
  const [records, setRecords] = useState<StepRecords>(() => readRecords(episode))
  const [running, setRunning] = useState<string | null>(null)

  const persist = useCallback(
    (next: StepRecords) => {
      setRecords(next)
      try {
        window.localStorage.setItem(storageKey(episode), JSON.stringify(next))
      } catch {
        // A full or blocked storage must not take the page down; the ticks just
        // stop surviving a reload.
      }
    },
    [episode],
  )

  useEffect(() => {
    if (running === null) return
    const timer = setInterval(() => {
      setRecords((current) => {
        const record = current[running] ?? EMPTY
        const next = { ...current, [running]: { ...record, seconds: record.seconds + 1 } }
        try {
          window.localStorage.setItem(storageKey(episode), JSON.stringify(next))
        } catch {
          // Same as above: counting continues, persistence is best effort.
        }
        return next
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [running, episode])

  return (
    <div className="dsh-lingualab-card">
      <h2>{t('steps')}</h2>
      <div className="dsh-lingualab-steps">
        {STEPS.map((step) => {
          const record = records[step.id] ?? EMPTY
          const isRunning = running === step.id
          return (
            <div
              key={step.id}
              className={`dsh-lingualab-step${record.done ? ' is-done' : ''}${isRunning ? ' is-current' : ''}`}
            >
              <input
                type="checkbox"
                checked={record.done}
                onChange={(event) =>
                  persist({ ...records, [step.id]: { ...record, done: event.target.checked } })
                }
                title={record.done ? t('stepUndone') : t('stepDone')}
              />
              <span className="dsh-lingualab-step-label">{t(step.labelKey)}</span>
              <span className="dsh-lingualab-step-mins">
                {step.inSession ? `${step.minutes} ${t('minutes')}` : t('stepInSession')}
              </span>
              <span className="dsh-lingualab-time">
                {Math.floor(record.seconds / 60)}:{String(record.seconds % 60).padStart(2, '0')}
              </span>
              {step.inSession ? (
                <button
                  type="button"
                  className={`dsh-lingualab-btn${isRunning ? ' is-on' : ''}`}
                  onClick={() => setRunning(isRunning ? null : step.id)}
                >
                  {isRunning ? t('stepStop') : t('stepStart')}
                </button>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
