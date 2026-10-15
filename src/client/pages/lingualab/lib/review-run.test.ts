// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { startReview, type ReviewItem, type ReviewSession } from '../../../features/review/index.ts'
import type { NotePhrase } from '../../../shared/protocol.ts'
import { answerFor, reviewIndexOf, runSession, type ReviewStage } from './review-run.ts'

const phrase = (at: number, over: Partial<NotePhrase> = {}): NotePhrase => ({
  at,
  text: `line ${String(at)}`,
  zh: '',
  note: '',
  tags: [],
  done: false,
  ...over,
})

const item = (episode: string, at: number, over: Partial<NotePhrase> = {}): ReviewItem => ({
  episode,
  title: `Episode ${episode}`,
  phrase: phrase(at, over),
})

const sessionOf = (...items: ReviewItem[]): ReviewSession => {
  const session = startReview(items, 'library')
  if (session === null) throw new Error('a session needs items')
  return session
}

/** A stage that records what the driver did to it, in order, and opens the episodes it is told can be opened. */
function stageFor(openable: (item: ReviewItem) => boolean) {
  const log: string[] = []
  const shown: ReviewSession[] = []
  const stage: ReviewStage = {
    show: (session) => {
      shown.push(session)
      log.push(`show:${String(session.at)}`)
    },
    goTo: (next) => {
      log.push(`goTo:${next.episode}@${String(next.phrase.at)}`)
      return Promise.resolve(openable(next))
    },
    stop: () => {
      log.push('stop')
    },
  }
  return { stage, log, shown }
}

describe('runSession', () => {
  it('shows the session, then puts its first item on stage', async () => {
    const { stage, log } = stageFor(() => true)
    await runSession(sessionOf(item('E1', 4), item('E1', 9)), stage)
    expect(log).toEqual(['show:0', 'goTo:E1@4'])
  })

  it('does not stop the player while an item is on stage', async () => {
    const stop = vi.fn()
    await runSession(sessionOf(item('E1', 4)), { show: vi.fn(), goTo: () => Promise.resolve(true), stop })
    expect(stop).not.toHaveBeenCalled()
  })

  it('records an item that cannot be opened as gone and tries the next', async () => {
    const { stage, log, shown } = stageFor((next) => next.episode !== 'E1')
    await runSession(sessionOf(item('E1', 4), item('E1', 9), item('E2', 1)), stage)
    expect(log).toEqual(['show:0', 'goTo:E1@4', 'show:1', 'goTo:E1@9', 'show:2', 'goTo:E2@1'])
    // What is shown last is the session at the item that opened, with the two before it recorded as gone.
    expect(shown[2]?.outcomes).toEqual(['gone', 'gone', null])
  })

  it('ends with the finished session shown and the player stopped when nothing can be opened', async () => {
    const { stage, log, shown } = stageFor(() => false)
    await runSession(sessionOf(item('E1', 4), item('E2', 9)), stage)
    expect(log).toEqual(['show:0', 'goTo:E1@4', 'show:1', 'goTo:E2@9', 'show:2', 'stop'])
    expect(shown.at(-1)?.outcomes).toEqual(['gone', 'gone'])
  })

  it('stops the player for a session that is already through, without opening anything', async () => {
    const { stage, log } = stageFor(() => true)
    await runSession({ ...sessionOf(item('E1', 4)), at: 1 }, stage)
    expect(log).toEqual(['show:1', 'stop'])
  })

  it('keeps what was recorded before it was handed in', async () => {
    const { stage, shown } = stageFor((next) => next.phrase.at !== 9)
    const start = { ...sessionOf(item('E1', 4), item('E1', 9), item('E1', 12)), at: 1, outcomes: ['got', null, null] as const }
    await runSession(start, stage)
    expect(shown.at(-1)?.outcomes).toEqual(['got', 'gone', null])
    expect(shown.at(-1)?.at).toBe(2)
  })
})

describe('reviewIndexOf', () => {
  const stored = [phrase(4), phrase(9, { segment: '02_b' }), phrase(9, { segment: '01_a' })]

  it('finds the item among the open episode\'s notes by the sentence it is', () => {
    expect(reviewIndexOf(item('E1', 4), 'E1', stored)).toBe(0)
    expect(reviewIndexOf(item('E1', 9, { segment: '01_a' }), 'E1', stored)).toBe(2)
  })

  it('tells two segments\' sentences at the same second apart', () => {
    expect(reviewIndexOf(item('E1', 9, { segment: '02_b' }), 'E1', stored)).toBe(1)
  })

  it('is -1 when there is no item', () => {
    expect(reviewIndexOf(null, 'E1', stored)).toBe(-1)
  })

  it('is -1 until the notes held are the item\'s own episode\'s', () => {
    expect(reviewIndexOf(item('E1', 4), 'E2', stored)).toBe(-1)
    expect(reviewIndexOf(item('E1', 4), null, stored)).toBe(-1)
  })

  it('is -1 when the sentence is no longer among the notes', () => {
    expect(reviewIndexOf(item('E1', 77), 'E1', stored)).toBe(-1)
  })
})

describe('answerFor', () => {
  const session = sessionOf(item('E1', 4), item('E1', 9))
  const stored = [phrase(4, { tags: ['hard'] }), phrase(9)]

  it('takes nothing when no review is running, or its queue is through', () => {
    expect(answerFor(null, 'skipped', 0, stored)).toBeNull()
    expect(answerFor({ ...session, at: 2 }, 'skipped', 0, stored)).toBeNull()
    expect(answerFor({ ...session, at: 2 }, 'got', 0, stored)).toBeNull()
  })

  it('writes nothing for a skip, and moves on', () => {
    const answer = answerFor(session, 'skipped', 0, stored)
    expect(answer?.write).toBeNull()
    expect(answer?.next.at).toBe(1)
    expect(answer?.next.outcomes).toEqual(['skipped', null])
  })

  it('writes nothing for an item that is gone, even with no notes to write to', () => {
    const answer = answerFor(session, 'gone', -1, [])
    expect(answer?.write).toBeNull()
    expect(answer?.next.outcomes).toEqual(['gone', null])
  })

  it('writes the grade into the notes at the item\'s index, and moves on', () => {
    const answer = answerFor(session, 'got', 0, stored)
    expect(answer?.write).toEqual({ index: 0, patch: { ...stored[0], done: true, tags: [] } })
    expect(answer?.next.outcomes).toEqual(['got', null])
  })

  it('marks a fuzzy sentence for review and keeps it practised', () => {
    const answer = answerFor(session, 'fuzzy', 1, stored)
    expect(answer?.write?.index).toBe(1)
    expect(answer?.write?.patch).toMatchObject({ done: false, tags: ['review'] })
  })

  it('marks a sentence that was not remembered hard', () => {
    const answer = answerFor(session, 'notyet', 1, stored)
    expect(answer?.write?.patch).toMatchObject({ done: false, tags: ['hard'] })
  })

  it('takes no grade until the item\'s notes are read: the item stays on stage', () => {
    expect(answerFor(session, 'got', -1, stored)).toBeNull()
    expect(answerFor(session, 'got', 5, stored)).toBeNull()
    expect(answerFor(session, 'got', 0, [])).toBeNull()
  })
})
