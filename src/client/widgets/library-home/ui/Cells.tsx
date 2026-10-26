/**
 * Where listening got to, as one bar per segment, and the say line that goes with it.
 *
 * The stage and the table both draw them, at two heights: the stage's is the 6px bar under the title,
 * a row's the 4px one under its place.
 */
import { Fragment } from 'react'
import { finishedSegments, isFinished, type EpisodeProgress, type PositionTable } from '../../../features/resume/index.ts'
import { segmentProgress } from '../../../shared/progress.ts'
import type { EpisodeEntry } from '../../../shared/protocol.ts'
import type { SayPart } from '../lib/say.ts'

/** One cell: how far into its segment listening got, and whether it was heard out. */
interface CellSpec {
  readonly at: number
  readonly duration: number
  readonly finished: boolean
}

/** What the position table says about each segment of an episode, in segment order; one cell for a file. */
function segmentCells(progress: PositionTable, entry: EpisodeEntry, summary: EpisodeProgress): readonly CellSpec[] {
  if (entry.segments.length === 0) {
    const item = summary.entry
    return [{ at: item?.at ?? 0, duration: item?.duration ?? 0, finished: isFinished(item) }]
  }
  const ids = entry.segments.map((segment) => segment.id)
  const done = finishedSegments(progress, entry)
  return entry.segments.map((segment) => {
    const item = segmentProgress(progress, entry.id, segment.id, ids)
    return { at: item?.at ?? 0, duration: item?.duration ?? 0, finished: done.has(segment.id) }
  })
}

/** Which cell holds the current place: the one segment the button opens, or the file once it has a place. */
function currentCell(entry: EpisodeEntry, summary: EpisodeProgress): number | null {
  if (summary.entry === null) return null
  if (entry.segments.length === 0) return 0
  const id = summary.next ?? summary.segment
  const index = entry.segments.findIndex((segment) => segment.id === id)
  return index < 0 ? null : index
}

/**
 * The bar. A finished cell is full; the current one fills as far as listening got. A current cell whose
 * length is unknown gets a ring instead, so an unknown length does not read as nothing heard.
 */
export function SegmentCells({
  progress,
  entry,
  summary,
  size,
}: {
  readonly progress: PositionTable
  readonly entry: EpisodeEntry
  readonly summary: EpisodeProgress
  readonly size: 'stage' | 'row'
}) {
  const current = currentCell(entry, summary)
  return (
    <div className={`dsh-lingualab-cells is-${size}`} aria-hidden="true">
      {segmentCells(progress, entry, summary).map((cell, index) => {
        const now = index === current && !cell.finished
        const fill = cell.duration > 0 ? Math.min(1, Math.max(0, cell.at / cell.duration)) : null
        const classes = ['dsh-lingualab-seg']
        if (cell.finished) classes.push('is-done')
        if (now && fill === null) classes.push('is-hollow')
        return (
          <span key={index} className={classes.join(' ')}>
            {now && fill !== null ? <i style={{ width: `${String(fill * 100)}%` }} /> : null}
          </span>
        )
      })}
    </div>
  )
}

/**
 * The say items as one sentence joined by ` · `, warnings in the warning colour. A span, because a table
 * row is a button and may only hold phrasing content.
 */
export function SayLine({ parts }: { readonly parts: readonly SayPart[] }) {
  return (
    <span className="dsh-lingualab-say">
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index === 0 ? null : ' · '}
          {part.warn ? <em className="is-warn">{part.text}</em> : part.text}
        </Fragment>
      ))}
    </span>
  )
}
