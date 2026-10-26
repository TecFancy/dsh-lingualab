/**
 * The five steps of one episode, side by side under the stage's bar.
 *
 * The home's answer to "which step am I on", which before this only the practice page's drawer could
 * give. Each step is a bar, its name and one line: what it took when done, the suggested time (and the
 * time used so far) for the one to do next, the suggested time for the rest. It shows; it does not
 * tick: ticking stays in the drawer, where the clocks run.
 */
import {
  currentStep,
  stepClock,
  stepFill,
  STEPS,
  stepsDone,
  type StepDefinition,
  type StepRecord,
  type StepRecords,
} from '../../../features/resume/index.ts'
import type { Translate } from '../../../context.ts'

const EMPTY: StepRecord = { done: false, seconds: 0 }

/** The line under a step's name. */
function stepMeta(t: Translate, step: StepDefinition, record: StepRecord, now: boolean): string {
  if (record.done) return record.seconds > 0 ? t('stepTook', { clock: stepClock(record.seconds) }) : t('homeStepDone')
  const suggested = t('stepSuggested', { minutes: step.minutes })
  if (!now || record.seconds === 0) return suggested
  return `${suggested} · ${t('stepUsed', { clock: stepClock(record.seconds) })}`
}

/** The strip. */
export function StepStrip({ t, records }: { readonly t: Translate; readonly records: StepRecords }) {
  const current = currentStep(records)
  return (
    <div className="dsh-lingualab-steps">
      <div className="dsh-lingualab-steps-head">
        <h2>{t('homeStepsTitle')}</h2>
        <span>{t('stepsProgress', { done: stepsDone(records), total: STEPS.length })}</span>
      </div>
      <ol className="dsh-lingualab-steps-list">
        {STEPS.map((step) => {
          const record = records[step.id] ?? EMPTY
          const now = step.id === current?.id
          const state = record.done ? ' is-done' : now ? ' is-now' : ''
          return (
            <li key={step.id} className={`dsh-lingualab-step${state}`} aria-current={now ? 'step' : undefined}>
              <span className="dsh-lingualab-step-bar" aria-hidden="true">
                {now ? <i style={{ width: `${String(stepFill(step, record))}%` }} /> : null}
              </span>
              <span className="dsh-lingualab-step-name">{t(step.labelKey)}</span>
              <span className="dsh-lingualab-step-meta">{stepMeta(t, step, record, now)}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
