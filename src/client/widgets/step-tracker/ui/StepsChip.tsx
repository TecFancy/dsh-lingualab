/**
 * The top bar's button for the five steps: five small bars, then the step it is on.
 *
 * The home's stage says 「继续跟读模仿」, so the button inside the episode says the same thing rather than a bare
 * count: the step whose clock is running, else the first step not ticked, else 「练完」. While a clock runs, its time
 * follows the name, so the drawer need not be open to see it. In a narrow top bar the name drops out like the other
 * chips' words and the bars and the clock stay; the whole of it stays as the button's name for a screen reader.
 */
import { currentStep, stepBars, stepClock, STEPS, stepsDone, type StepRecords } from '../../../features/resume/index.ts'
import type { Translate } from '../../../context.ts'

export interface StepsChipProps {
  readonly t: Translate
  readonly records: StepRecords
  /** The step whose clock is running, or `null`. */
  readonly running: string | null
  readonly open: boolean
  readonly onToggle: () => void
}

export function StepsChip({ t, records, running, open, onToggle }: StepsChipProps) {
  const named = STEPS.find((step) => step.id === running) ?? currentStep(records)
  const label = named === null ? t('stepsChipDone') : t(named.labelKey)
  const clock = running === null ? null : stepClock(records[running]?.seconds ?? 0)
  const bars = stepBars(records, named?.id ?? null)
  const name = t('stepsChip', { done: stepsDone(records), total: STEPS.length, step: clock === null ? label : `${label} ${clock}` })
  return (
    <button
      type="button"
      className={`dsh-lingualab-chip${open ? ' is-on' : ''}`}
      onClick={onToggle}
      title={t('stepsTitle')}
      aria-label={name}
      aria-expanded={open}
    >
      <span className="dsh-lingualab-chip-bars" aria-hidden="true">
        {STEPS.map((step, index) => (
          <span key={step.id} className={`dsh-lingualab-chip-bar is-${bars[index] ?? 'todo'}`} />
        ))}
      </span>
      <span className="dsh-lingualab-chip-text">{label}</span>
      {clock === null ? null : <span className="dsh-lingualab-chip-clock">{clock}</span>}
    </button>
  )
}
