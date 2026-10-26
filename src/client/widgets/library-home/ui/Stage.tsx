/**
 * The stage: the one episode to continue, as the biggest thing on the page.
 *
 * Top to bottom it answers what the reader came to ask: which episode and when it was last heard, where
 * in it listening stopped, which of the five steps is next, and one filled button that goes there. The
 * button names the step (「继续跟读模仿」) rather than saying 「继续练习」, and the line beside it says
 * where the audio picks up, so pressing it holds no surprise.
 */
import { findSegment, segmentNumber } from '../../../features/library/index.ts'
import {
  currentStep,
  type EpisodeProgress,
  type PositionTable,
  type StepRecords,
} from '../../../features/resume/index.ts'
import { formatClock } from '../../../shared/lib/format.ts'
import type { EpisodeEntry } from '../../../shared/protocol.ts'
import type { Translate } from '../../../context.ts'
import { keptSay, materialSay } from '../lib/say.ts'
import { resumeHint, stageAction, stageKicker } from '../lib/stage.ts'
import { SegmentCells } from './Cells.tsx'
import { StepStrip } from './StepStrip.tsx'

/** What the stage is drawn from. */
export interface StageProps {
  readonly t: Translate
  readonly entry: EpisodeEntry
  readonly summary: EpisodeProgress
  readonly progress: PositionTable
  readonly records: StepRecords
  /** The clock the kicker's 「2 小时前」 is read against. */
  readonly now: number
  readonly opening: boolean
  readonly onOpen: (id: string) => void
}

/** The stage's right column: where listening stopped, in the biggest figure on the page. */
function StageWhere({ t, entry, summary }: Pick<StageProps, 't' | 'entry' | 'summary'>) {
  const item = summary.entry
  if (item === null) {
    return <div className="dsh-lingualab-where"><div className="dsh-lingualab-where-num is-word">{t('homeNotStarted')}</div></div>
  }
  if (entry.segments.length === 0) {
    return (
      <div className="dsh-lingualab-where">
        <div className="dsh-lingualab-where-num">
          {formatClock(item.at)}
          {item.duration > 0 ? <span className="dsh-lingualab-where-of"> / {formatClock(item.duration)}</span> : null}
        </div>
        <div className="dsh-lingualab-where-sub">{`${t('homeHeardHere')} · ${t('homeWholeFile')}`}</div>
      </div>
    )
  }
  // An episode whose last segment was heard out continues at the next one, which is what the button opens.
  const next = summary.next !== summary.segment
  const segment = findSegment(entry.segments, next ? summary.next : summary.segment)
  const count = t('homeSegmentCount', { done: summary.finished, total: summary.total })
  return (
    <div className="dsh-lingualab-where">
      <div className="dsh-lingualab-where-num">{segment === null ? '' : segmentNumber(segment)}</div>
      <div className="dsh-lingualab-where-sub">
        {`${next ? t('homeNextSegment') : t('stoppedAt', { time: formatClock(item.at) })} · ${count}`}
      </div>
    </div>
  )
}

/** The stage. */
export function Stage({ t, entry, summary, progress, records, now, opening, onOpen }: StageProps) {
  const chips = [...materialSay(t, entry), ...keptSay(t, entry)]
  const hint = resumeHint(t, entry, summary)
  return (
    <section className="dsh-lingualab-stage-card" aria-label={entry.title}>
      <div className="dsh-lingualab-stage-head">
        <div className="dsh-lingualab-stage-id">
          <p className="dsh-lingualab-kicker">{stageKicker(t, summary, now)}</p>
          <h1 className="dsh-lingualab-stage-title">{entry.title}</h1>
          <p className="dsh-lingualab-chips">
            {chips.map((chip) => (
              <span key={chip.text} className={chip.warn ? 'is-warn' : undefined}>{chip.text}</span>
            ))}
          </p>
        </div>
        <StageWhere t={t} entry={entry} summary={summary} />
      </div>
      <SegmentCells progress={progress} entry={entry} summary={summary} size="stage" />
      <StepStrip t={t} records={records} />
      <div className="dsh-lingualab-stage-act">
        <button type="button" className="dsh-lingualab-btn is-primary" onClick={() => onOpen(entry.id)} disabled={opening}>
          {opening ? <span className="dsh-lingualab-spinner" aria-hidden /> : <span className="dsh-lingualab-tri" aria-hidden />}
          {stageAction(t, summary, currentStep(records))}
        </button>
        {hint === null ? null : <span className="dsh-lingualab-stage-hint">{hint}</span>}
      </div>
    </section>
  )
}
