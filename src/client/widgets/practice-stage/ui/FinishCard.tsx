/**
 * What the page says when an episode reaches its end.
 *
 * Playback that just stops is the page not noticing that you finished something. This
 * card does the one useful thing: it counts what the session produced (sentences heard,
 * sentences kept, how many of those are still being practised), and it offers the three
 * next moves in the order people take them: listen again, the next episode, or the list.
 * It floats over the stage rather than replacing it, and closing it leaves the finished
 * episode exactly where it was.
 */
import { CheckIcon, PlayIcon } from '../../../shared/ui/icons.tsx'
import type { Translate } from '../../../context.ts'

export interface FinishCardProps {
  readonly t: Translate
  readonly title: string
  readonly sentences: number
  readonly kept: number
  readonly practising: number
  /** The title of the next episode in the library, or `null` for the last one. */
  readonly nextTitle: string | null
  readonly onAgain: () => void
  readonly onNext: () => void
  readonly onHome: () => void
  readonly onClose: () => void
}

/** The end-of-episode summary. */
export function FinishCard({ t, title, sentences, kept, practising, nextTitle, onAgain, onNext, onHome, onClose }: FinishCardProps) {
  return (
    <div className="dsh-lingualab-finish" role="dialog" aria-label={t('finishTitle')}>
      <div className="dsh-lingualab-finish-card">
        <span className="dsh-lingualab-finish-badge">
          <CheckIcon size={22} />
        </span>
        <h2>{t('finishTitle')}</h2>
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
              <PlayIcon size={15} /> {t('finishNext', { title: nextTitle })}
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
