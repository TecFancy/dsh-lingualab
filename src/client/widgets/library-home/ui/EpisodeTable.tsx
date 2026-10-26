/**
 * The whole library as a table under the bench: one row per episode, filtered by where it stands.
 *
 * It lists every episode, the one on the stage too, so the counts on the filter add up to the library;
 * that row says 「当前」. A row says what the material is, where listening stopped, where the five
 * steps stand, and what was kept, and opens the episode on a click. The table scrolls sideways in its
 * box on a narrow screen instead of squeezing its columns.
 */
import { useState } from 'react'
import { findSegment, segmentNumber } from '../../../features/library/index.ts'
import {
  currentStep,
  episodeProgress,
  isFinished,
  practiceStatus,
  STEPS,
  type EpisodeProgress,
  type PositionTable,
  type StepRecords,
  type StepsTable,
} from '../../../features/resume/index.ts'
import { formatClock } from '../../../shared/lib/format.ts'
import type { EpisodeEntry } from '../../../shared/protocol.ts'
import { ChevronIcon } from '../../../shared/ui/icons.tsx'
import { Segmented } from '../../../shared/ui/Segmented.tsx'
import type { Translate } from '../../../context.ts'
import { filterCounts, filterEpisodes, FILTERS, type EpisodeFilter } from '../lib/filter.ts'
import { keptSay, materialSay } from '../lib/say.ts'
import { SayLine, SegmentCells } from './Cells.tsx'

const FILTER_KEYS = { all: 'homeFilterAll', active: 'homeFilterActive', new: 'homeFilterNew', done: 'homeFilterDone' } as const

export interface EpisodeTableProps {
  readonly t: Translate
  readonly entries: readonly EpisodeEntry[]
  /** The episode the stage holds, whose row says so. */
  readonly staged: string | null
  readonly progress: PositionTable
  readonly steps: StepsTable
  readonly opening: boolean
  readonly onOpen: (id: string) => void
}

/** The table, with its heading and filter. */
export function EpisodeTable({ t, entries, staged, progress, steps, opening, onOpen }: EpisodeTableProps) {
  const [filter, setFilter] = useState<EpisodeFilter>('all')
  const counts = filterCounts(entries, progress, steps)
  const shown = filterEpisodes(entries, filter, progress, steps)
  const options = FILTERS.map((id) => ({ id, label: t(FILTER_KEYS[id]), count: counts[id] }))
  return (
    <section className="dsh-lingualab-library" aria-label={t('homeEpisodes')}>
      <div className="dsh-lingualab-library-head">
        <h2>{t('homeEpisodes')}</h2>
        <Segmented options={options} value={filter} onChange={setFilter} label={t('homeFilterLabel')} size="small" />
      </div>
      <div className="dsh-lingualab-table-box">
        <div className="dsh-lingualab-table">
          <div className="dsh-lingualab-table-head" aria-hidden="true">
            <span>{t('homeColEpisode')}</span>
            <span>{t('homeColWhere')}</span>
            <span>{t('homeColSteps')}</span>
            <span>{t('homeColKept')}</span>
            <span />
          </div>
          {shown.length === 0 ? <p className="dsh-lingualab-table-empty">{t('homeFilterEmpty')}</p> : null}
          {shown.map((entry) => (
            <EpisodeRow key={entry.id} t={t} entry={entry} staged={entry.id === staged} progress={progress}
              records={steps[entry.id] ?? {}} disabled={opening} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </section>
  )
}

/** Where an episode stands, in one short phrase: not started, heard out, or the place. */
function whereText(t: Translate, entry: EpisodeEntry, summary: EpisodeProgress): string {
  const item = summary.entry
  if (item === null) return t('homeNotStarted')
  const out = summary.total === 0 ? isFinished(item) : summary.finished === summary.total
  if (out) return t('homeFinished')
  const time = formatClock(item.at)
  if (entry.segments.length === 0) return t('homeHeardTime', { time })
  const next = summary.next !== summary.segment
  const segment = findSegment(entry.segments, next ? summary.next : summary.segment)
  const number = segment === null ? '' : segmentNumber(segment)
  return next ? t('homeHeardNext', { segment: number }) : t('homeHeardSegment', { segment: number, time })
}

/**
 * Five small bars, done and next and still to come, then the name of the step to do next. An episode not
 * started yet has no step to do next: its bars are all grey and the label is left out.
 */
function StepDots({ t, records, fresh }: { readonly t: Translate; readonly records: StepRecords; readonly fresh: boolean }) {
  const current = fresh ? null : currentStep(records)
  return (
    <span className="dsh-lingualab-dots">
      {STEPS.map((step) => {
        const state = records[step.id]?.done === true ? ' is-done' : step.id === current?.id ? ' is-now' : ''
        return <span key={step.id} className={`dsh-lingualab-dot-bar${state}`} aria-hidden="true" />
      })}
      {fresh ? null : (
        <span className="dsh-lingualab-dots-label">{current === null ? t('homeFilterDone') : t(current.labelKey)}</span>
      )}
    </span>
  )
}

/** One row: a button that opens the episode. */
function EpisodeRow({ t, entry, staged, progress, records, disabled, onOpen }: {
  readonly t: Translate
  readonly entry: EpisodeEntry
  readonly staged: boolean
  readonly progress: PositionTable
  readonly records: StepRecords
  readonly disabled: boolean
  readonly onOpen: (id: string) => void
}) {
  const summary = episodeProgress(progress, entry)
  const material = staged ? [...materialSay(t, entry), { text: t('homeNowPracticing'), warn: false }] : materialSay(t, entry)
  const kept = keptSay(t, entry)
  return (
    <button type="button" className="dsh-lingualab-table-row" onClick={() => onOpen(entry.id)} disabled={disabled}>
      <span className="dsh-lingualab-cell-episode">
        <span className="dsh-lingualab-row-title" title={entry.title}>{entry.title}</span>
        <SayLine parts={material} />
      </span>
      <span className="dsh-lingualab-cell-where">
        <span>{whereText(t, entry, summary)}</span>
        <SegmentCells progress={progress} entry={entry} summary={summary} size="row" />
      </span>
      <StepDots t={t} records={records} fresh={practiceStatus(records, summary.entry !== null) === 'new'} />
      <span className="dsh-lingualab-cell-kept">{kept.map((part) => part.text).join(' · ')}</span>
      <span className="dsh-lingualab-cell-go" aria-hidden="true"><ChevronIcon size={16} /></span>
    </button>
  )
}
