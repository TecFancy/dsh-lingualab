/**
 * A review: a queue of kept sentences, gone through one at a time, each graded or skipped.
 *
 * Everything here is a pure function of the session value, so the page can ask for the next item
 * in the same event that records a grade, and the rules (what is in the queue, in which order,
 * what 「再过一遍」 takes) are tested without a player. Where an item is heard, and how a grade is
 * written to its episode's notes, is the page's: it owns the player and the open episode.
 *
 * Two scopes share the shape. An **episode** review is the open episode's sentences not yet
 * 「记住了」; a **library** review is the same across every episode, from `GET /lingualab/review`.
 * Both are in play order: episode by episode in library order, then segment, then time.
 */
import { inPlayOrder, type GivenGrade } from '../../../shared/notes-format.ts'
import type { NotePhrase, ReviewPayload } from '../../../shared/protocol.ts'

/** One sentence to review, with the episode it is in. */
export interface ReviewItem {
  readonly episode: string
  /** The episode's title, for the strip. */
  readonly title: string
  /** The phrase as it was when the review started; it is matched, not trusted, when graded. */
  readonly phrase: NotePhrase
}

/** What happened to one item: a grade, passed over, or its episode could not be opened. */
export type ReviewOutcome = GivenGrade | 'skipped' | 'gone'

export type ReviewScope = 'episode' | 'library'

export interface ReviewSession {
  readonly scope: ReviewScope
  readonly items: readonly ReviewItem[]
  /** The item being reviewed; equal to the length once the queue is through. */
  readonly at: number
  /** One per item, `null` until it has one. */
  readonly outcomes: readonly (ReviewOutcome | null)[]
}

/** How a review went, for the card at its end. */
export interface ReviewTally {
  readonly got: number
  readonly fuzzy: number
  readonly notyet: number
  readonly skipped: number
  readonly gone: number
}

/** The open episode's sentences still to review, in play order. */
export function episodeQueue(
  episode: string,
  title: string,
  phrases: readonly NotePhrase[],
  segmentOrder: readonly string[],
): ReviewItem[] {
  return inPlayOrder(
    phrases.filter((phrase) => !phrase.done),
    segmentOrder,
  ).map((phrase) => ({ episode, title, phrase }))
}

/** Every episode's sentences still to review, in the order the host listed them. */
export function libraryQueue(payload: ReviewPayload): ReviewItem[] {
  return payload.episodes.flatMap((entry) =>
    inPlayOrder(entry.phrases, entry.segments).map((phrase) => ({ episode: entry.episode, title: entry.title, phrase })),
  )
}

/** A session over these items, or `null` when there is nothing to review. */
export function startReview(items: readonly ReviewItem[], scope: ReviewScope): ReviewSession | null {
  if (items.length === 0) return null
  return { scope, items, at: 0, outcomes: items.map(() => null) }
}

/** The item being reviewed, or `null` once the queue is through. */
export function currentItem(session: ReviewSession): ReviewItem | null {
  return session.items[session.at] ?? null
}

/** Whether every item has been through. */
export function isFinished(session: ReviewSession): boolean {
  return session.at >= session.items.length
}

/** Record what happened to the current item and move to the next one. */
export function recordOutcome(session: ReviewSession, outcome: ReviewOutcome): ReviewSession {
  if (isFinished(session)) return session
  const outcomes = session.outcomes.map((item, index) => (index === session.at ? outcome : item))
  return { ...session, at: session.at + 1, outcomes }
}

/** Go back one item, keeping what was recorded for it until it is graded again. */
export function stepBack(session: ReviewSession): ReviewSession {
  return session.at === 0 ? session : { ...session, at: session.at - 1 }
}

/** Count the outcomes. */
export function tallyReview(session: ReviewSession): ReviewTally {
  const count = (outcome: ReviewOutcome): number => session.outcomes.filter((item) => item === outcome).length
  return { got: count('got'), fuzzy: count('fuzzy'), notyet: count('notyet'), skipped: count('skipped'), gone: count('gone') }
}

/** Another pass over the items graded 「没记住」, in the same order, or `null` when there are none. */
export function retryNotYet(session: ReviewSession): ReviewSession | null {
  return startReview(
    session.items.filter((_, index) => session.outcomes[index] === 'notyet'),
    session.scope,
  )
}
