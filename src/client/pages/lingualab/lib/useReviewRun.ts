/**
 * A review as the page runs it: the session, and what starts, answers and ends it.
 *
 * The review feature keeps the queue and knows nothing of a player; this hook is where the page, which owns the
 * player, the open episode and its notes, holds the session and drives it. What is decided (which item is next when
 * one cannot be opened, what an answer writes) is in `review-run.ts`; what is left here is the state and the wiring
 * to the page: the notes a grade is written to, the place the reader was listening, the layers a review closes.
 *
 * Opening an item (its episode and segment, then the replay of the sentence) is the opening code's, handed in as
 * `goToItem`, because it is the same path the home uses to open an episode.
 */
import { useCallback, useState } from 'react'
import type { MutableRefObject } from 'react'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import type { NotesState } from '../../../features/notes/index.ts'
import {
  currentItem,
  episodeQueue,
  isFinished,
  libraryQueue,
  startReview,
  type ReviewItem,
  type ReviewOutcome,
  type ReviewSession,
} from '../../../features/review/index.ts'
import type { EpisodeEntry, EpisodeSegment, ReviewPayload } from '../../../shared/protocol.ts'
import { answerFor, reviewIndexOf, runSession } from './review-run.ts'

/** What the review reads from and does to the rest of the page. */
export interface ReviewRunOptions {
  /** The open episode, which 「复习本集」 reviews. */
  readonly episode: EpisodeEntry | null
  readonly segments: readonly EpisodeSegment[]
  /** The open episode's notes: the grade of an answer is written to them. */
  readonly notes: Pick<NotesState, 'episode' | 'phrases' | 'update'>
  /** The sentences still to review in every episode, which the home's review reads; `null` before it is read. */
  readonly libraryReview: ReviewPayload | null
  /** Put an item on stage, opening its episode (at its segment) first; `false` when it cannot be opened. */
  readonly goToItem: (item: ReviewItem) => Promise<boolean>
  /**
   * Whether a review is running, for the bookmark: a review jumps between kept sentences, and writing those places
   * down would move 「继续」 to wherever the review last was. A ref, set here as a review starts and ends, because the
   * bookmark's own cleanup runs after them.
   */
  readonly reviewing: MutableRefObject<boolean>
  /** Write the listening position down; the review calls it once, before it starts moving the position. */
  readonly bookmark: () => void
  /** Close what is over the practice view (the layers, the steps drawer, the timing strip), because a review takes it over. */
  readonly closeLayers: () => void
}

/** The running review, and what drives it. */
export interface ReviewRun {
  /** The session, or `null` when no review is on the page (running or showing its summary). */
  readonly review: ReviewSession | null
  /** The item being reviewed, or `null` when there is none (no review, or its queue is through). */
  readonly reviewItem: ReviewItem | null
  /** The stored index of the review item in the open episode's notes, once they are read; -1 before. */
  readonly reviewIndex: number
  /** A review is running: an item is on stage and the strip shows. */
  readonly reviewOn: boolean
  /** A review has run through its queue and its summary card is up. */
  readonly reviewDone: boolean
  /** Move a review to the session given, and put its current item on stage. */
  readonly runReview: (session: ReviewSession) => void
  /** Review this episode's sentences still being practised. */
  readonly reviewEpisode: () => void
  /** Review every episode's, from the home. */
  readonly reviewLibrary: () => void
  /** End the review where it is: the sentence on stage stays there. */
  readonly endReview: () => void
  /** Record what happened to the item on stage and go on to the next one. */
  readonly answerReview: (outcome: ReviewOutcome) => void
}

/** Hold and drive the page's review. */
export function useReviewRun({
  episode,
  segments,
  notes,
  libraryReview,
  goToItem,
  reviewing: reviewingRef,
  bookmark,
  closeLayers,
}: ReviewRunOptions): ReviewRun {
  const [review, setReview] = useState<ReviewSession | null>(null)

  const runReview = useCallback(
    (session: ReviewSession): void => {
      void runSession(session, {
        show: setReview,
        goTo: goToItem,
        stop: () => useMediaPlayer.getState().setPlaying(false),
      })
    },
    [goToItem],
  )

  /** Start a review over these items; nothing happens for an empty queue. */
  const beginReview = useCallback(
    (items: readonly ReviewItem[], scope: ReviewSession['scope']): void => {
      const session = startReview(items, scope)
      if (session === null) return
      // The place the reader was listening is written down before the review starts moving it.
      bookmark()
      reviewingRef.current = true
      closeLayers()
      runReview(session)
    },
    [bookmark, reviewingRef, closeLayers, runReview],
  )

  const reviewEpisode = useCallback((): void => {
    if (episode === null) return
    beginReview(
      episodeQueue(
        episode.id,
        episode.title,
        notes.phrases,
        segments.map((item) => item.id),
      ),
      'episode',
    )
  }, [episode, notes.phrases, segments, beginReview])

  const reviewLibrary = useCallback((): void => {
    if (libraryReview === null) return
    beginReview(libraryQueue(libraryReview), 'library')
  }, [libraryReview, beginReview])

  const endReview = useCallback((): void => {
    reviewingRef.current = false
    setReview(null)
  }, [reviewingRef])

  const reviewItem = review === null ? null : currentItem(review)
  const reviewIndex = reviewIndexOf(reviewItem, notes.episode, notes.phrases)

  const answerReview = useCallback(
    (outcome: ReviewOutcome): void => {
      const answer = answerFor(review, outcome, reviewIndex, notes.phrases)
      if (answer === null) return
      if (answer.write !== null) notes.update(answer.write.index, answer.write.patch)
      runReview(answer.next)
    },
    [review, notes, reviewIndex, runReview],
  )

  const reviewOn = review !== null && !isFinished(review)
  return {
    review,
    reviewItem,
    reviewIndex,
    reviewOn,
    reviewDone: review !== null && !reviewOn,
    runReview,
    reviewEpisode,
    reviewLibrary,
    endReview,
    answerReview,
  }
}
