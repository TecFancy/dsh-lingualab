// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { Cue } from '../../../entities/cue/index.ts'
import type { NotePhrase } from '../../../shared/protocol.ts'
import type { SavedTiming } from '../../../widgets/timing-editor/index.ts'
import { keptMoves, timingBlockedReason } from './retime.ts'

const phrase = (at: number, text: string, over: Partial<NotePhrase> = {}): NotePhrase => ({
  at,
  text,
  zh: '',
  note: '',
  tags: [],
  done: false,
  ...over,
})

const cue = (text: string, startMs: number): Cue => ({ start: startMs / 1000, end: startMs / 1000 + 2, text })

/** A save that moved the start of one cue from `fromMs` to `toMs`, and perhaps pushed neighbours. */
function saved(text: string, fromMs: number, toMs: number, pushed: Array<[string, number, number]> = []): SavedTiming {
  const range = (ms: number) => ({ start: ms, end: ms + 2000 })
  return {
    index: 1,
    cue: cue(text, fromMs),
    before: range(fromMs),
    after: range(toMs),
    pushed: pushed.map(([pushedText, from, to]) => ({ cue: cue(pushedText, from), before: range(from), after: range(to) })),
  }
}

describe('keptMoves', () => {
  const stored = [phrase(9, 'Before'), phrase(12, 'Edited line'), phrase(15, 'After')]

  it('moves the kept phrase of an edited sentence whose start crossed a second', () => {
    expect(keptMoves(saved('Edited line', 12400, 11800), stored, null)).toEqual([{ index: 1, at: 11.8 }])
  })

  it('leaves the phrase where it is when the start stayed inside its second', () => {
    expect(keptMoves(saved('Edited line', 12100, 12900), stored, null)).toEqual([])
  })

  it('moves nothing for a sentence that is not kept', () => {
    expect(keptMoves(saved('Not kept', 20400, 19800), stored, null)).toEqual([])
  })

  it('moves the phrases of the neighbours the edit pushed, too', () => {
    const moves = keptMoves(saved('Edited line', 12400, 11800, [['After', 15200, 14800]]), stored, null)
    expect(moves).toEqual([
      { index: 1, at: 11.8 },
      { index: 2, at: 14.8 },
    ])
  })

  it('moves a pushed neighbour even when the edited sentence is not kept', () => {
    const moves = keptMoves(saved('Not kept', 12400, 12300, [['After', 15200, 14800]]), stored, null)
    expect(moves).toEqual([{ index: 2, at: 14.8 }])
  })

  it('finds the phrase in the segment of the sentence and not in another', () => {
    const inSegments = [phrase(12, 'Edited line', { segment: '01_a' }), phrase(12, 'Edited line', { segment: '02_b' })]
    expect(keptMoves(saved('Edited line', 12400, 11800), inSegments, '02_b')).toEqual([{ index: 1, at: 11.8 }])
    expect(keptMoves(saved('Edited line', 12400, 11800), inSegments, '01_a')).toEqual([{ index: 0, at: 11.8 }])
  })

  it('matches by the English of a bilingual cue', () => {
    expect(keptMoves(saved('Edited line\n已编辑', 12400, 11800), stored, null)).toEqual([{ index: 1, at: 11.8 }])
  })
})

describe('timingBlockedReason', () => {
  it('lets a folder episode be saved: it is always inside the library', () => {
    expect(timingBlockedReason('folder', false, 'outside')).toBeNull()
  })

  it('lets a loose file at the library root be saved', () => {
    expect(timingBlockedReason('file', true, 'outside')).toBeNull()
  })

  it('refuses a file from outside the library, with the message it is given', () => {
    expect(timingBlockedReason('file', false, 'outside')).toBe('outside')
  })

  it('has nothing to refuse while no episode is open', () => {
    expect(timingBlockedReason(null, false, 'outside')).toBeNull()
  })
})
