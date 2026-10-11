import { describe, expect, it } from 'vitest'
import type { NotePhrase, ReviewPayload } from '../../../shared/protocol.ts'
import {
  currentItem,
  episodeQueue,
  isFinished,
  libraryQueue,
  recordOutcome,
  retryNotYet,
  startReview,
  stepBack,
  tallyReview,
} from './session.ts'

const phrase = (at: number, over: Partial<NotePhrase> = {}): NotePhrase => ({
  at,
  text: `line ${String(at)}`,
  zh: '',
  note: '',
  tags: [],
  done: false,
  ...over,
})

describe('the queue', () => {
  it('takes an episode\'s sentences not yet learned, in play order', () => {
    const items = episodeQueue(
      'E1',
      'Episode one',
      [phrase(30, { segment: '02_b' }), phrase(9, { done: true }), phrase(12, { segment: '01_a' }), phrase(4)],
      ['01_a', '02_b'],
    )
    expect(items.map((item) => item.phrase.at)).toEqual([4, 12, 30])
    expect(items[0]).toMatchObject({ episode: 'E1', title: 'Episode one' })
  })

  it('follows the host\'s episode order across the library', () => {
    const payload: ReviewPayload = {
      ok: true,
      reason: null,
      total: 3,
      episodes: [
        { episode: 'E2', title: 'Two', kind: 'folder', segments: [], phrases: [phrase(8), phrase(3)] },
        { episode: 'file.1', title: 'Loose', kind: 'file', segments: [], phrases: [phrase(1)] },
      ],
    }
    expect(libraryQueue(payload).map((item) => [item.episode, item.phrase.at])).toEqual([
      ['E2', 3],
      ['E2', 8],
      ['file.1', 1],
    ])
  })
})

describe('a review session', () => {
  const items = episodeQueue('E1', 'One', [phrase(1), phrase(2), phrase(3), phrase(4)], [])

  it('does not start on an empty queue', () => {
    expect(startReview([], 'episode')).toBeNull()
  })

  it('records an outcome per item and moves on until the queue is through', () => {
    let session = startReview(items, 'episode')
    if (session === null) throw new Error('no session')
    expect(currentItem(session)?.phrase.at).toBe(1)
    session = recordOutcome(session, 'got')
    session = recordOutcome(session, 'notyet')
    session = recordOutcome(session, 'skipped')
    expect(isFinished(session)).toBe(false)
    session = recordOutcome(session, 'notyet')
    expect(isFinished(session)).toBe(true)
    expect(currentItem(session)).toBeNull()
    expect(recordOutcome(session, 'got')).toBe(session)
    expect(tallyReview(session)).toEqual({ got: 1, fuzzy: 0, notyet: 2, skipped: 1, gone: 0 })
  })

  it('goes back one item and lets it be graded again', () => {
    let session = startReview(items, 'library')
    if (session === null) throw new Error('no session')
    expect(stepBack(session)).toBe(session)
    session = recordOutcome(recordOutcome(session, 'fuzzy'), 'skipped')
    session = stepBack(session)
    expect(currentItem(session)?.phrase.at).toBe(2)
    session = recordOutcome(session, 'got')
    expect(tallyReview(session)).toMatchObject({ fuzzy: 1, got: 1, skipped: 0 })
  })

  it('goes again over the sentences graded 「没记住」, in the same order and scope', () => {
    let session = startReview(items, 'library')
    if (session === null) throw new Error('no session')
    for (const outcome of ['notyet', 'got', 'gone', 'notyet'] as const) session = recordOutcome(session, outcome)
    const again = retryNotYet(session)
    expect(again?.scope).toBe('library')
    expect(again?.items.map((item) => item.phrase.at)).toEqual([1, 4])
    expect(again?.outcomes).toEqual([null, null])
    session = startReview(items, 'episode')
    expect(session === null ? null : retryNotYet(recordOutcome(session, 'got'))).toBeNull()
  })
})
