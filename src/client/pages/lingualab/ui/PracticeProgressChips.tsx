/**
 * The top bar's second group: the five steps and the settings.
 *
 * These are this episode's progress and the page's own settings, so they stand apart from the right column's pair
 * behind the bar's thin line. The settings button is handed in because what pressing it closes is the page's state;
 * the steps keep their own drawer here, which places itself against the page rather than against this group.
 */
import type { ReactNode } from 'react'
import type { Translate } from '../../../context.ts'
import type { EpisodeEntry } from '../../../shared/protocol.ts'
import { StepTracker } from '../../../widgets/step-tracker/index.ts'

export interface PracticeProgressChipsProps {
  readonly t: Translate
  /** The episode open, which also keys the steps; `null` before the host has answered. */
  readonly episode: EpisodeEntry | null
  readonly stepsOpen: boolean
  readonly onToggleSteps: () => void
  readonly onBlindRunning: (running: boolean) => void
  /** The settings button, which the page builds because its drawer is the page's state. */
  readonly settings: ReactNode
}

export function PracticeProgressChips({
  t,
  episode,
  stepsOpen,
  onToggleSteps,
  onBlindRunning,
  settings,
}: PracticeProgressChipsProps) {
  return (
    <div className="dsh-lingualab-top-group" role="group" aria-label={t('topGroupProgress')}>
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
