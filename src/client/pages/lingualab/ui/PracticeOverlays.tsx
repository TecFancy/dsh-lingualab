/**
 * What sits over the stage and under it: the review's strip and summary, the end-of-episode card, and the line that
 * says the subtitles could not be read.
 *
 * Each is a small part of its own because each depends on a different thing (the review, the segment that just ended,
 * the library's last error) and none of them on the others; the widgets draw them, these hand the widgets what the
 * page's hooks know.
 */
import { useMemo } from 'react'
import type { Translate } from '../../../context.ts'
import { findSegment, nextSegment, segmentLabel, type LibraryState } from '../../../features/library/index.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import type { NotesState } from '../../../features/notes/index.ts'
import { retryNotYet, stepBack, tallyReview } from '../../../features/review/index.ts'
import { FinishCard } from '../../../widgets/practice-stage/index.ts'
import { ReviewFinish, ReviewStrip } from '../../../widgets/review-strip/index.ts'
import type { ReviewRun } from '../lib/useReviewRun.ts'
import type { FinishSlot } from './practice-props.ts'

/** The strip above the stage while a review runs: where it is, the grades, skip, back and exit. */
export function ReviewBar({ t, library, review }: { readonly t: Translate; readonly library: LibraryState; readonly review: ReviewRun }) {
  const { review: session, reviewItem, reviewIndex, reviewOn, answerReview, runReview, endReview } = review
  if (session === null || !reviewOn || reviewItem === null) return null
  const segment = reviewItem.phrase.segment === undefined ? null : findSegment(library.segments, reviewItem.phrase.segment)
  return (
    <ReviewStrip
      t={t}
      position={session.at + 1}
      total={session.items.length}
      source={segment === null ? reviewItem.title : `${reviewItem.title} · ${segmentLabel(segment)}`}
      ready={reviewIndex >= 0}
      onGrade={answerReview}
      onSkip={() => answerReview('skipped')}
      onBack={() => runReview(stepBack(session))}
      onExit={endReview}
    />
  )
}

/** The card at the end of a review: how it went, and another pass over what was not remembered. */
export function ReviewSummary({ t, review }: { readonly t: Translate; readonly review: ReviewRun }) {
  const { review: session, reviewOn, runReview, endReview } = review
  if (session === null || reviewOn) return null
  return (
    <ReviewFinish
      t={t}
      tally={tallyReview(session)}
      onAgain={() => {
        const again = retryNotYet(session)
        if (again === null) endReview()
        else runReview(again)
      }}
      onExit={endReview}
    />
  )
}

/** The line that says the subtitles could not be read, with a retry; only for audio that has nothing else to show. */
export function SubtitleError({ t, library }: { readonly t: Translate; readonly library: LibraryState }) {
  if (library.error === null || library.cues.length > 0 || library.media === null) return null
  return (
    <div className="dsh-lingualab-error" style={{ textAlign: 'center' }}>
      {t('subtitleFailed')}{' '}
      <button type="button" className="dsh-lingualab-btn" onClick={library.reload}>
        {t('retry')}
      </button>
    </div>
  )
}

/**
 * The end-of-episode card.
 *
 * The end of a segment that is not the last offers the next segment; only the last segment (or an episode without
 * segments) says the episode is done, and offers the next episode. The card's counts are the segment's own: it is the
 * unit that was just listened to.
 */
export function FinishOverlay({
  t,
  library,
  notes,
  finish,
}: {
  readonly t: Translate
  readonly library: LibraryState
  readonly notes: NotesState
  readonly finish: FinishSlot
}) {
  const { segment, segments, episode, cues } = library
  const segmentId = segment?.id ?? null
  const following = nextSegment(segments, segmentId)
  const phrases = useMemo(
    () => (segmentId === null ? notes.phrases : notes.phrases.filter((phrase) => (phrase.segment ?? segments[0]?.id) === segmentId)),
    [notes.phrases, segmentId, segments],
  )
  const { nextEpisode, onDismiss, onOpenSegment, onOpenEpisode, onHome } = finish
  return (
    <FinishCard
      t={t}
      title={following !== null && segment !== null ? segmentLabel(segment) : (episode?.title ?? '')}
      scope={following === null ? 'episode' : 'segment'}
      sentences={cues.length}
      kept={phrases.length}
      practising={phrases.filter((phrase) => !phrase.done).length}
      nextTitle={following === null ? (nextEpisode?.title ?? null) : following.title}
      onAgain={() => {
        onDismiss()
        useMediaPlayer.getState().seek(0)
        useMediaPlayer.getState().setPlaying(true)
      }}
      onNext={() => {
        onDismiss()
        if (following !== null) onOpenSegment(following.id)
        else if (nextEpisode !== null) onOpenEpisode(nextEpisode.id)
      }}
      onHome={() => {
        onDismiss()
        onHome()
      }}
      onClose={onDismiss}
    />
  )
}
