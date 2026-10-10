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
 * elapsed seconds are per episode and are progress through today's material rather than
 * part of the notes file the agent reads. They are cached in this browser and shared
 * through the host, so another device shows the same ticks.
 */
import { useCallback, useEffect, useState } from 'react'
import { readSteps, writeSteps, type StepRecord } from '../../../features/resume/index.ts'
import { CheckIcon, CloseIcon } from '../../../shared/ui/icons.tsx'
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

type StepRecords = Readonly<Record<string, StepRecord>>

const EMPTY: StepRecord = { done: false, seconds: 0 }

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
  const [records, setRecords] = useState<StepRecords>(() => readSteps(episode))
  const [running, setRunning] = useState<string | null>(null)

  // Ticks are cached in this browser and shared through the host (see the resume feature),
  // so what was ticked on another device shows up here too.
  const persist = useCallback(
    (next: StepRecords) => {
      setRecords(next)
      writeSteps(episode, next)
    },
    [episode],
  )

  useEffect(() => {
    if (running === null) return
    const timer = setInterval(() => {
      setRecords((current) => {
        const record = current[running] ?? EMPTY
        const next = { ...current, [running]: { ...record, seconds: record.seconds + 1 } }
        writeSteps(episode, next)
        return next
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [running, episode])

  const done = STEPS.filter((step) => (records[step.id] ?? EMPTY).done).length
  const fraction = done / STEPS.length

  return (
    <>
      <button type="button" className={`dsh-lingualab-chip${open ? ' is-on' : ''}`} onClick={onToggle}>
        {t('stepsChip')} {done}/{STEPS.length}
      </button>
      {open ? (
        <aside className="dsh-lingualab-popover">
          <div className="dsh-lingualab-notes-head">
            <span className="dsh-lingualab-drawer-titles">
              <span className="dsh-lingualab-drawer-title">{t('stepsTitle')}</span>
              <span className="dsh-lingualab-drawer-sub">
                {t('stepsProgress', { done, total: STEPS.length })}
              </span>
            </span>
            <span className="dsh-lingualab-spacer" />
            <button type="button" className="dsh-lingualab-icon-btn" onClick={onToggle} title={t('close')}>
              <CloseIcon />
            </button>
          </div>
          <div className="dsh-lingualab-steps-body">
            <div className="dsh-lingualab-steps-total">
              <div className="dsh-lingualab-bar" aria-hidden>
                <div className="dsh-lingualab-bar-fill" style={{ width: `${String(fraction * 100)}%` }} />
              </div>
            </div>
            <div className="dsh-lingualab-steps">
              {STEPS.map((step, index) => {
                const record = records[step.id] ?? EMPTY
                const isRunning = running === step.id
                // The step to do next: the first one not yet ticked, so the card says where you are.
                const isNext = !record.done && STEPS.slice(0, index).every((before) => (records[before.id] ?? EMPTY).done)
                const clock = `${String(Math.floor(record.seconds / 60))}:${String(record.seconds % 60).padStart(2, '0')}`
                return (
                  <div
                    key={step.id}
                    className={`dsh-lingualab-step${record.done ? ' is-done' : ''}${isRunning || isNext ? ' is-current' : ''}`}
                  >
                    <label
                      className={`dsh-lingualab-step-check${record.done ? ' is-on' : ''}`}
                      title={record.done ? t('stepUndone') : t('stepDone')}
                    >
                      <input
                        type="checkbox"
                        className="dsh-lingualab-visually-hidden"
                        checked={record.done}
                        onChange={(event) =>
                          persist({ ...records, [step.id]: { ...record, done: event.target.checked } })
                        }
                      />
                      {record.done ? <CheckIcon size={14} /> : <span>{index + 1}</span>}
                    </label>
                    <span className="dsh-lingualab-step-main">
                      <span className="dsh-lingualab-step-label">{t(step.labelKey)}</span>
                      <span className="dsh-lingualab-step-mins">
                        {step.inSession ? `${String(step.minutes)} ${t('minutes')} · ${clock}` : t('stepInSession')}
                      </span>
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
        </aside>
      ) : null}
    </>
  )
}