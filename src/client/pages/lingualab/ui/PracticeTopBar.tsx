/**
 * The practice view's top bar: back to the list, what is open and where in it, the segment list, the right column's
 * two buttons (the kept sentences, and collapsing the column), the five steps and the settings.
 *
 * Everything it shows is handed in and every press is a callback: which layer opens, what the other drawers do when
 * this one does, and how a segment is opened are the page's, because they are the page's states.
 */
import type { ReactNode } from 'react'
import type { Translate } from '../../../context.ts'
import { segmentLabel } from '../../../features/library/index.ts'
import type { EpisodeEntry, EpisodeSegment } from '../../../shared/protocol.ts'
import { BackIcon } from '../../../shared/ui/icons.tsx'
import { SegmentPicker } from '../../../widgets/segment-picker/index.ts'
import { StepTracker } from '../../../widgets/step-tracker/index.ts'
import { PracticeSideChips, type PracticeSideChipsProps } from './PracticeSideChips.tsx'

export interface PracticeTopBarProps {
  readonly t: Translate
  /** The episode open, or `null` before the host has answered. */
  readonly episode: EpisodeEntry | null
  /** The segment open, or `null` for an episode without segments. */
  readonly segment: EpisodeSegment | null
  readonly segments: readonly EpisodeSegment[]
  /** The ids of the segments heard to the end, which the list marks. */
  readonly finishedIds: ReadonlySet<string>
  readonly segmentsOpen: boolean
  /** The sentence on stage, counted from 0, and how many there are; `null` while there is none. */
  readonly sentence: { readonly index: number; readonly total: number } | null
  /** The right column: whether it is collapsed, which view it shows, and the moves of its two buttons. */
  readonly side: PracticeSideChipsProps['side']
  /** How many sentences are kept. */
  readonly keptCount: number
  readonly stepsOpen: boolean
  /** The settings button, at the bar's right end. */
  readonly settings: ReactNode
  readonly onHome: () => void
  readonly onToggleSegments: () => void
  readonly onCloseSegments: () => void
  readonly onSelectSegment: (id: string) => void
  readonly onToggleSteps: () => void
  readonly onBlindRunning: (running: boolean) => void
}

export function PracticeTopBar({
  t,
  episode,
  segment,
  segments,
  finishedIds,
  segmentsOpen,
  sentence,
  side,
  keptCount,
  stepsOpen,
  settings,
  onHome,
  onToggleSegments,
  onCloseSegments,
  onSelectSegment,
  onToggleSteps,
  onBlindRunning,
}: PracticeTopBarProps) {
  return (
    <div className="dsh-lingualab-top">
      <button type="button" className="dsh-lingualab-chip" onClick={onHome} title={t('backToList')} aria-label={t('backToList')}>
        <BackIcon size={14} />
        <span className="dsh-lingualab-chip-text">{t('backToList')}</span>
      </button>
      <div className="dsh-lingualab-top-heading">
        <span className="dsh-lingualab-top-title" title={episode?.title ?? ''}>
          {episode?.title ?? t('openEpisode')}
        </span>
        {segment !== null || sentence !== null ? (
          <span className="dsh-lingualab-top-sub">
            {[
              segment === null ? null : segmentLabel(segment),
              sentence === null ? null : t('cueOf', { n: sentence.index + 1, total: sentence.total }),
            ]
              .filter((part) => part !== null)
              .join(' · ')}
          </span>
        ) : null}
      </div>
      {segments.length > 0 ? (
        <SegmentPicker
          t={t}
          segments={segments}
          currentId={segment?.id ?? null}
          finished={finishedIds}
          open={segmentsOpen}
          onToggle={onToggleSegments}
          onClose={onCloseSegments}
          onSelect={onSelectSegment}
        />
      ) : null}
      <span className="dsh-lingualab-spacer" />
      <PracticeSideChips t={t} side={side} keptCount={keptCount} />
      {episode !== null ? (
        <StepTracker
          key={episode.id}
          t={t}
          episode={episode.id}
          open={stepsOpen}
          onToggle={onToggleSteps}
          onBlindRunning={onBlindRunning}
        />
      ) : null}
      {settings}
    </div>
  )
}
