/**
 * What the page says when an episode reaches its end.
 *
 * Playback that just stops is the page not noticing that you finished something. This
 * card does the one useful thing: it counts what the session produced (sentences heard,
 * sentences kept, how many of those are still being practised), and it offers the three
 * next moves in the order people take them: listen again, the next episode, or the list.
 * It floats over the stage rather than replacing it, and closing it leaves the finished
 * episode exactly where it was.
 *
 * An episode cut into segments finishes one segment at a time. For a segment that is not the
 * last the card says the segment is done and its first action, focused, is the next segment;
 * only the last segment says the episode is done, and then the next thing is the next episode.
 * The counts are the segment's own, because a segment is the unit that was just listened to.
 */
import { CheckIcon, PlayIcon } from '../../../shared/ui/icons.tsx'
import type { Translate } from '../../../context.ts'

export interface FinishCardProps {
  readonly t: Translate
  /** What was finished: the episode's title, or the segment's number and title. */
  readonly title: string
  /** `segment` when more segments follow this one; `episode` for an episode that is done. */
  readonly scope: 'segment' | 'episode'
  readonly sentences: number
  readonly kept: number
  readonly practising: number
  /** The title of what comes next: the next segment, or for the end of an episode the next episode; `null` for neither. */
  readonly nextTitle: string | null
  readonly onAgain: () => void
  readonly onNext: () => void
  readonly onHome: () => void
  readonly onClose: () => void
}

/** The end-of-episode summary. */
export function FinishCard({
  t,
  title,
  scope,
  sentences,
  kept,
  practising,
  nextTitle,
  onAgain,
  onNext,
  onHome,
  onClose,
}: FinishCardProps) {
  const heading = scope === 'segment' ? t('finishSegmentTitle') : t('finishTitle')
  return (
    <div className="dsh-lingualab-finish" role="dialog" aria-label={heading}>
      <div className="dsh-lingualab-finish-card">
        <span className="dsh-lingualab-finish-badge">
          <CheckIcon size={22} />
        </span>
        <h2>{heading}</h2>
        <p>{title}</p>
        <dl className="dsh-lingualab-finish-stats">
          <div>
            <dt>{sentences}</dt>
            <dd>{t('finishSentences')}</dd>
          </div>
          <div>
            <dt>{kept}</dt>
            <dd>{t('finishKept')}</dd>
          </div>
          <div>
            <dt>{practising}</dt>
            <dd>{t('finishPractising')}</dd>
          </div>
        </dl>
        <div className="dsh-lingualab-actions" style={{ justifyContent: 'center' }}>
          {nextTitle !== null ? (
            <button type="button" className="dsh-lingualab-btn is-primary is-large" onClick={onNext} autoFocus>
              <PlayIcon size={15} /> {t(scope === 'segment' ? 'finishNextSegment' : 'finishNext', { title: nextTitle })}
            </button>
          ) : null}
          <button type="button" className={`dsh-lingualab-btn is-large${nextTitle === null ? ' is-primary' : ''}`} onClick={onAgain}>
            {t('finishAgain')}
          </button>
          <button type="button" className="dsh-lingualab-btn is-large" onClick={onHome}>
            {t('backToList')}
          </button>
        </div>
        <button type="button" className="dsh-lingualab-link" onClick={onClose}>
          {t('finishClose')}
        </button>
      </div>
    </div>
  )
}
