/**
 * The top bar's group for the five steps: the one chip on the right that is about this episode's practice.
 *
 * It stands before the bar's thin line, apart from the icon buttons after it, which are tools for the page. The steps
 * keep their own drawer here, which places itself against the page rather than against this group.
 */
import type { Translate } from '../../../context.ts'
import type { EpisodeEntry } from '../../../shared/protocol.ts'
import { StepTracker } from '../../../widgets/step-tracker/index.ts'

export interface PracticeStepsGroupProps {
  readonly t: Translate
  /** The episode open, which also keys the steps; `null` before the host has answered. */
  readonly episode: EpisodeEntry | null
  readonly stepsOpen: boolean
  readonly onToggleSteps: () => void
  readonly onBlindRunning: (running: boolean) => void
}

export function PracticeStepsGroup({ t, episode, stepsOpen, onToggleSteps, onBlindRunning }: PracticeStepsGroupProps) {
  return (
    <div className="dsh-lingualab-top-group" role="group" aria-label={t('topGroupSteps')}>
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
    </div>
  )
}
