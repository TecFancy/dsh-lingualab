/**
 * The right column of the bench: the weekly pass over kept sentences, and the way to add an episode.
 *
 * The review card says one number big, then where the sentences come from as a short list (three
 * episodes, then 「等 N 集」), so it cannot grow with the library. The add card is the page's only
 * place for adding: it names the drop, which works anywhere on the page, and offers the two buttons
 * for when a drag is not possible. While a file is over the page its edge turns the brand colour.
 */
import type { ReviewPayload } from '../../../shared/protocol.ts'
import { PlusIcon } from '../../../shared/ui/icons.tsx'
import type { Translate } from '../../../context.ts'
import { FilePicker } from './DropZone.tsx'

/** How many source episodes the review card names before it sums the rest up. */
const SOURCES_SHOWN = 3

/** The weekly pass: how many kept sentences are still being practised, and where they come from. */
export function ReviewCard({
  t,
  review,
  opening,
  onReview,
}: {
  readonly t: Translate
  readonly review: ReviewPayload
  readonly opening: boolean
  readonly onReview: () => void
}) {
  const sources = review.episodes
  const only = sources.length === 1 ? sources[0] : undefined
  const shown = sources.length > SOURCES_SHOWN ? sources.slice(0, SOURCES_SHOWN - 1) : sources
  const rest = sources.length - shown.length
  return (
    <section className="dsh-lingualab-review-card" aria-label={t('reviewHomeTitle')}>
      <p className="dsh-lingualab-kicker">{t('reviewHomeTitle')}</p>
      <div className="dsh-lingualab-review-line">
        <span className="dsh-lingualab-review-num">{review.total}</span>
        <span>{t('homeReviewUnit')}</span>
      </div>
      {only !== undefined ? (
        <p className="dsh-lingualab-review-from">{t('homeReviewFrom', { title: only.title })}</p>
      ) : (
        <ul className="dsh-lingualab-review-list">
          {shown.map((item) => (
            <li key={item.episode}>
              <span>{item.title}</span>
              <span>{t('reviewFromCount', { count: item.phrases.length })}</span>
            </li>
          ))}
          {rest > 0 ? <li><span>{t('reviewFromMore', { count: rest })}</span></li> : null}
        </ul>
      )}
      <button type="button" className="dsh-lingualab-btn" onClick={onReview} disabled={opening}>
        {t('reviewHomeStart')}
      </button>
    </section>
  )
}

/** The one place to add an episode. */
export function AddCard({
  t,
  busy,
  onFiles,
  onBrowse,
}: {
  readonly t: Translate
  readonly busy: boolean
  readonly onFiles: (files: readonly File[]) => void
  readonly onBrowse: () => void
}) {
  return (
    <section className="dsh-lingualab-add-card" aria-label={t('homeAddTitle')}>
      <div className="dsh-lingualab-add-head">
        <span className="dsh-lingualab-add-mark" aria-hidden="true"><PlusIcon size={16} /></span>
        <span className="dsh-lingualab-add-title">{t('homeAddTitle')}</span>
      </div>
      <p className="dsh-lingualab-add-body">
        <span className="dsh-lingualab-add-text">{t('homeAddBody')}</span>
        <span className="dsh-lingualab-add-release">{t('dropRelease')}</span>
      </p>
      <div className="dsh-lingualab-add-act">
        <FilePicker onFiles={onFiles} disabled={busy}>{t('chooseFiles')}</FilePicker>
        <button type="button" className="dsh-lingualab-btn is-text" onClick={onBrowse} disabled={busy}>
          {t('browseExisting')}
        </button>
      </div>
    </section>
  )
}
