/**
 * What the page says when a review reaches the end of its queue.
 *
 * It counts the grades given, and offers the one next move the method asks for: another pass
 * over the sentences graded 「没记住」, while they are still fresh. Sentences passed over are
 * counted too, and those whose episode could not be opened are named apart, so a short count is
 * never a mystery.
 */
import { CheckIcon } from '../../../shared/ui/icons.tsx'
import type { Translate } from '../../../context.ts'
import type { ReviewTally } from '../../../features/review/index.ts'

export interface ReviewFinishProps {
  readonly t: Translate
  readonly tally: ReviewTally
  /** Go again over the 「没记住」 ones; not offered when there are none. */
  readonly onAgain: () => void
  readonly onExit: () => void
}

/** The end-of-review card. */
export function ReviewFinish({ t, tally, onAgain, onExit }: ReviewFinishProps) {
  return (
    <div className="dsh-lingualab-finish" role="dialog" aria-label={t('reviewFinishTitle')}>
      <div className="dsh-lingualab-finish-card">
        <span className="dsh-lingualab-finish-badge">
          <CheckIcon size={22} />
        </span>
        <h2>{t('reviewFinishTitle')}</h2>
        <dl className="dsh-lingualab-finish-stats is-four">
          <div>
            <dt>{tally.got}</dt>
            <dd>{t('gradeGot')}</dd>
          </div>
          <div>
            <dt>{tally.fuzzy}</dt>
            <dd>{t('gradeFuzzy')}</dd>
          </div>
          <div>
            <dt>{tally.notyet}</dt>
            <dd>{t('gradeNotYet')}</dd>
          </div>
          <div>
            <dt>{tally.skipped}</dt>
            <dd>{t('reviewSkipped')}</dd>
          </div>
        </dl>
        {tally.gone > 0 ? <p className="dsh-lingualab-hint">{t('reviewGone', { count: tally.gone })}</p> : null}
        <div className="dsh-lingualab-actions" style={{ justifyContent: 'center' }}>
          {tally.notyet > 0 ? (
            <button type="button" className="dsh-lingualab-btn is-primary is-large" onClick={onAgain} autoFocus>
              {t('reviewAgain', { count: tally.notyet })}
            </button>
          ) : null}
          <button
            type="button"
            className={`dsh-lingualab-btn is-large${tally.notyet > 0 ? '' : ' is-primary'}`}
            onClick={onExit}
            autoFocus={tally.notyet === 0}
          >
            {t('reviewExit')}
          </button>
        </div>
      </div>
    </div>
  )
}
