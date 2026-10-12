/**
 * The five steps of the study method, as a chip with a drawer.
 *
 * The method is a timed ritual (blind watch, subtitle read, shadowing, next-day
 * review, weekly review) and the reason the earlier standalone app went unused was
 * that nothing in it knew which step you were on. This answers that one question.
 *
 * It is a chip rather than a card because it is not what you look at while listening:
 * a permanent panel spent a third of the page on something consulted twice a session,
 * and made every other block look equally important. It does not enforce anything —
 * no alarms, no locks, no scolding — and opening it never pauses the audio. Ticks and
 * elapsed seconds are per episode and are progress through today's material rather than
 * part of the notes file the agent reads. They are cached in this browser and shared
 * through the host, so another device shows the same ticks.
 *
 * The drawer is a header, one bar of five segments (a step fills its segment as its clock runs, and
 * all of it once ticked), and a vertical stepper. Exactly one step on this page is open at a time,
 * the one with a clock and its two buttons: the one that is running, else the one the reader
 * picked, else the first not yet done. The last two steps happen in the conversation, so they
 * only say so. The drawer slides out as it slid in, which is why it outlives `open` for a moment.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { readSteps, writeSteps, type StepRecord } from '../../../features/resume/index.ts'
import { usePresence } from '../../../shared/lib/usePresence.ts'
import { CheckIcon, CloseIcon } from '../../../shared/ui/icons.tsx'
import type { Translate } from '../../../context.ts'

interface StepDefinition {
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

type StepRecords = Readonly<Record<string, StepRecord>>

const EMPTY: StepRecord = { done: false, seconds: 0 }

/**
 * How long the drawer takes to leave; the stylesheet's slide-out runs for the same time. The page
 * keeps the scrim behind it for as long.
 */
export const STEPS_EXIT_MS = 200

/** `0:19`, `22:04`: seconds as minutes and seconds. */
function clockOf(seconds: number): string {
  return `${String(Math.floor(seconds / 60))}:${String(seconds % 60).padStart(2, '0')}`
}

/** How full a step's segment is, in percent: all of it once done, else the clock against the suggested time. */
function fillOf(step: StepDefinition, record: StepRecord): number {
  if (record.done) return 100
  if (!step.inSession) return 0
  return Math.min(100, (record.seconds / (step.minutes * 60)) * 100)
}

/** The step whose timer the picture follows: the blind watch, which is the first one. */
export const BLIND_STEP = 'blind'

export interface StepTrackerProps {
  readonly t: Translate
  /** Also the component's key where it is used, which is how a new episode resets it. */
  readonly episode: string
  /** The drawer's open state, owned by the page so Escape can close it. */
  readonly open: boolean
  readonly onToggle: () => void
  /**
   * Told when the blind-watch step's timer starts (`true`) and when it stops (`false`: paused, the step
   * marked done, or the tracker leaving). It is the page's way to switch the picture to large and put it
   * back; opening the drawer says nothing. Also called with `false` when the tracker appears.
   */
  readonly onBlindRunning?: (running: boolean) => void
}

/** The chip plus, when open, the drawer. */
export function StepTracker({ t, episode, open, onToggle, onBlindRunning }: StepTrackerProps) {
  const [records, setRecords] = useState<StepRecords>(() => readSteps(episode))
  const [running, setRunning] = useState<string | null>(null)
  /** The step the reader clicked, which is the open one unless a clock is running. */
  const [picked, setPicked] = useState<string | null>(null)
  const { mounted } = usePresence(open, STEPS_EXIT_MS)
  const drawer = useRef<HTMLElement>(null)

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

  // The blind-watch timer is the one thing the rest of the page listens to. The latest callback is read from a
  // ref so a new function each render does not look like the timer starting again.
  const blindRunning = running === BLIND_STEP
  const report = useRef(onBlindRunning)
  useEffect(() => {
    report.current = onBlindRunning
  }, [onBlindRunning])
  useEffect(() => {
    report.current?.(blindRunning)
  }, [blindRunning])
  useEffect(
    () => () => {
      report.current?.(false)
    },
    [],
  )

  // Closing with a button of the drawer focused would drop focus to the document, and the page's
  // shortcuts with it; it goes back to the page, which is where the keys are read.
  useEffect(() => {
    if (open) return
    const element = drawer.current
    if (element === null || !element.contains(document.activeElement)) return
    element.closest<HTMLElement>('.dsh-lingualab-page')?.focus({ preventScroll: true })
  }, [open])

  const recordOf = (step: StepDefinition): StepRecord => records[step.id] ?? EMPTY
  const done = STEPS.filter((step) => recordOf(step).done).length
  /** A step the reader can open: one done on this page that is not done yet. */
  const openable = (step: StepDefinition): boolean => step.inSession && !recordOf(step).done
  const firstOpenable = STEPS.find(openable)?.id ?? null
  const pickedStep = STEPS.find((step) => step.id === picked)
  const openId =
    running ?? (pickedStep !== undefined && openable(pickedStep) ? pickedStep.id : null) ?? firstOpenable

  /** Tick a step, or take the tick back; a clock running on a step that is ticked stops. */
  const toggleDone = (step: StepDefinition): void => {
    const record = recordOf(step)
    if (running === step.id) setRunning(null)
    setPicked(null)
    persist({ ...records, [step.id]: { ...record, done: !record.done } })
  }

  const metaOf = (step: StepDefinition, record: StepRecord): string => {
    const suggested = t('stepSuggested', { minutes: step.minutes })
    if (!step.inSession) return suggested
    if (record.seconds === 0) return suggested
    if (record.done) return t('stepTook', { clock: clockOf(record.seconds) })
    return `${suggested} · ${t('stepUsed', { clock: clockOf(record.seconds) })}`
  }

  // `inert` is an attribute React 18 does not know, so it goes in as one: while the drawer leaves,
  // its buttons are out of the tab order and the hit test.
  const inertProps: Record<string, string> = open ? {} : { inert: '' }

  return (
    <>
      <button type="button" className={`dsh-lingualab-chip${open ? ' is-on' : ''}`} onClick={onToggle}>
        {t('stepsChip')} {done}/{STEPS.length}
      </button>
      {mounted ? (
        <aside
          ref={drawer}
          className={`dsh-lingualab-popover${open ? '' : ' is-leaving'}`}
          aria-hidden={!open}
          {...inertProps}
        >
          <div className="dsh-lingualab-drawer-head">
            <span className="dsh-lingualab-drawer-titles">
              <span className="dsh-lingualab-drawer-title">{t('stepsTitle')}</span>
              <span className="dsh-lingualab-drawer-sub">
                {t('stepsProgress', { done, total: STEPS.length })}
              </span>
            </span>
            <button
              type="button"
              className="dsh-lingualab-icon-btn"
              onClick={onToggle}
              title={t('close')}
              aria-label={t('close')}
            >
              <CloseIcon size={16} />
            </button>
          </div>

          <div className="dsh-lingualab-steps-bar" aria-hidden>
            {STEPS.map((step) => (
              <div className="dsh-lingualab-steps-seg" key={step.id}>
                <span style={{ width: `${fillOf(step, recordOf(step)).toFixed(1)}%` }} />
              </div>
            ))}
          </div>

          <div className="dsh-lingualab-steps-body">
            <ol className="dsh-lingualab-steps">
              {STEPS.map((step, index) => {
                const record = recordOf(step)
                const isRunning = running === step.id
                const expanded = openId === step.id && openable(step)
                const doneLabel = record.done ? t('stepUndone') : t('stepDone')
                const clock = clockOf(record.seconds)
                return (
                  <li
                    key={step.id}
                    className={`dsh-lingualab-step${record.done ? ' is-done' : ''}${expanded ? ' is-open' : ''}`}
                  >
                    <div className="dsh-lingualab-step-rail">
                      <button
                        type="button"
                        className={`dsh-lingualab-step-check${record.done ? ' is-on' : ''}`}
                        aria-pressed={record.done}
                        aria-label={doneLabel}
                        title={doneLabel}
                        onClick={() => toggleDone(step)}
                      >
                        {record.done ? <CheckIcon size={14} /> : <span>{index + 1}</span>}
                      </button>
                      {index < STEPS.length - 1 ? <span className="dsh-lingualab-step-line" aria-hidden /> : null}
                    </div>
                    <div className="dsh-lingualab-step-body">
                      <button
                        type="button"
                        className="dsh-lingualab-step-row"
                        disabled={!openable(step)}
                        onClick={() => setPicked(step.id)}
                      >
                        <span className="dsh-lingualab-step-main">
                          <span className="dsh-lingualab-step-label">{t(step.labelKey)}</span>
                          <span className="dsh-lingualab-step-meta">{metaOf(step, record)}</span>
                        </span>
                        {isRunning && !expanded ? <span className="dsh-lingualab-step-pill">{clock}</span> : null}
                        {step.inSession ? null : <span className="dsh-lingualab-step-tag">{t('stepInSession')}</span>}
                      </button>
                      {expanded ? (
                        <div className="dsh-lingualab-step-panel">
                          <div className="dsh-lingualab-step-clock">
                            <b>{clock}</b>
                            <span>/ {clockOf(step.minutes * 60)}</span>
                            {step.tipKey === undefined ? null : (
                              <span className="dsh-lingualab-step-tip">{t(step.tipKey)}</span>
                            )}
                          </div>
                          <div className="dsh-lingualab-step-progress" aria-hidden>
                            <span style={{ width: `${fillOf(step, record).toFixed(1)}%` }} />
                          </div>
                          <div className="dsh-lingualab-step-actions">
                            <button
                              type="button"
                              className={`dsh-lingualab-btn is-primary${isRunning ? ' is-running' : ''}`}
                              onClick={() => setRunning(isRunning ? null : step.id)}
                            >
                              {isRunning ? t('stepStop') : record.seconds > 0 ? t('stepResume') : t('stepStart')}
                            </button>
                            <button type="button" className="dsh-lingualab-btn" onClick={() => toggleDone(step)}>
                              {t('stepDone')}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>

          <footer className="dsh-lingualab-drawer-foot">{t('stepsFootnote')}</footer>
        </aside>
      ) : null}
    </>
  )
}
