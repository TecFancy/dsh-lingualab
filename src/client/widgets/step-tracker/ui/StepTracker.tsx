/**
 * The five steps of the study method, as a chip with a popover.
 *
 * The method is a timed ritual — blind watch, subtitle read, shadowing, next-day
 * review, weekly review — and the reason the earlier standalone app went unused was
 * that nothing in it knew which step you were on. This answers that one question.
 *
 * It is a chip rather than a card because it is not what you look at while listening:
 * a permanent panel spent a third of the page on something consulted twice a session,
 * and made every other block look equally important. It does not enforce anything —
 * no alarms, no locks, no scolding — and opening it never pauses the audio. Ticks and
 * elapsed seconds are per episode and live in `localStorage`, because they are progress
 * through today's material rather than part of the notes file the agent reads.
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

/** Where one episode's step progress is kept. */
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
  /** Also the component's key where it is used, which is how a new episode resets it. */
  readonly episode: string
  /** The popover's open state, owned by the page so Escape can close it. */
  readonly open: boolean
  readonly onToggle: () => void
}

/** The chip plus, when open, the checklist under it. */
export function StepTracker({ t, episode, open, onToggle }: StepTrackerProps) {
  const [records, setRecords] = useState<StepRecords>(() => readRecords(episode))
  const [running, setRunning] = useState<string | null>(null)

  const persist = useCallback(
    (next: StepRecords) => {
      setRecords(next)
      try {
        window.localStorage.setItem(storageKey(episode), JSON.stringify(next))
      } catch {
        // A full or blocked storage must not take the page down; the ticks just stop
        // surviving a reload.
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

  const done = STEPS.filter((step) => (records[step.id] ?? EMPTY).done).length

  return (
    <>
      <button type="button" className={`dsh-lingualab-chip${open ? ' is-on' : ''}`} onClick={onToggle}>
        {t('stepsChip')} {done}/{STEPS.length}
      </button>
      {open ? (
        <div className="dsh-lingualab-popover">
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
                    {step.inSession
                      ? `${step.minutes} ${t('minutes')} · ${Math.floor(record.seconds / 60)}:${String(record.seconds % 60).padStart(2, '0')}`
                      : t('stepInSession')}
                  </span>
                  {step.inSession ? (
                    <button
                      type="button"
                      className={`dsh-lingualab-btn${isRunning ? ' is-primary' : ''}`}
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
      ) : null}
    </>
  )
}
