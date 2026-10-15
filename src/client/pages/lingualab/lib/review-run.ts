/**
 * The decisions of a review that run on the page, apart from React.
 *
 * The review feature owns the queue (`features/review`: what is in it, what an outcome does to the session) and
 * knows nothing of a player. The page is where the queue, the player and the open episode meet, and it did two
 * things there that are logic rather than wiring: going on to the next item that can be opened, and deciding what an
 * answer writes. They are plain functions of the session and of what the page hands in, so they are tested without a
 * player or a DOM; `useReviewRun.ts` is the hook that holds the session and calls them.
 */
import {
  currentItem,
  isFinished,
  recordOutcome,
  type ReviewItem,
  type ReviewOutcome,
  type ReviewSession,
} from '../../../features/review/index.ts'
import { sameKeptSentence, withGrade } from '../../../shared/notes-format.ts'
import type { NotePhrase } from '../../../shared/protocol.ts'

/** What driving a review needs from the page. */
export interface ReviewStage {
  /** Make this the page's session, so the strip shows where the review is. */
  readonly show: (session: ReviewSession) => void
  /** Put one item on stage, opening its episode first when it is not the open one; `false` when it cannot be opened. */
  readonly goTo: (item: ReviewItem) => Promise<boolean>
  /** The queue is through: the player has nothing left to play. */
  readonly stop: () => void
}

/**
 * Move a review to the session given, and put its current item on stage.
 *
 * An item whose episode cannot be opened is recorded as gone and the next one is tried, so a renamed folder costs a
 * line in the summary rather than a stuck review. The session is shown before each try, so the strip counts the
 * item that is being opened; a session that is already through is shown and the player is stopped.
 */
export async function runSession(session: ReviewSession, stage: ReviewStage): Promise<void> {
  let next = session
  for (;;) {
    stage.show(next)
    const item = currentItem(next)
    if (item === null) {
      stage.stop()
      return
    }
    if (await stage.goTo(item)) return
    next = recordOutcome(next, 'gone')
  }
}

/**
 * Where the review item sits in the open episode's stored notes, or -1 before they are read.
 *
 * Notes are read per episode and a review can cross episodes, so the item is only findable once the notes held are
 * the item's own; it is matched by the sentence it is (whole second, text, segment), not by position, because the
 * list changes under a review as grades are written.
 */
export function reviewIndexOf(item: ReviewItem | null, notesEpisode: string | null, phrases: readonly NotePhrase[]): number {
  if (item === null || notesEpisode !== item.episode) return -1
  return phrases.findIndex((phrase) => sameKeptSentence(phrase, item.phrase))
}

/** What an answer does: the grade to write into the notes (if it is one), and the session that follows. */
export interface ReviewAnswer {
  readonly write: { readonly index: number; readonly patch: Partial<NotePhrase> } | null
  readonly next: ReviewSession
}

/**
 * What answering the item on stage does, or `null` when the answer cannot be taken yet.
 *
 * A skip and a gone item write nothing. A grade needs somewhere to go: the item's episode open and its notes read
 * (`index` found, and a phrase there); until then the key does nothing and the item stays on stage. Nothing is taken
 * once the queue is through.
 */
export function answerFor(
  session: ReviewSession | null,
  outcome: ReviewOutcome,
  index: number,
  phrases: readonly NotePhrase[],
): ReviewAnswer | null {
  if (session === null || isFinished(session)) return null
  if (outcome === 'skipped' || outcome === 'gone') return { write: null, next: recordOutcome(session, outcome) }
  const phrase = phrases[index]
  if (phrase === undefined) return null
  return { write: { index, patch: withGrade(phrase, outcome) }, next: recordOutcome(session, outcome) }
}
