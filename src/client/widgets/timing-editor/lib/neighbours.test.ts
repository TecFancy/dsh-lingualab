import { describe, expect, it } from 'vitest'
import type { Cue, PushedNeighbour } from '../../../entities/cue/index.ts'
import { neighbour } from './neighbours.ts'

const CUES: readonly Cue[] = [
  { start: 65, end: 67, text: 'Before.' },
  { start: 68, end: 70, text: 'Now.' },
  { start: 71, end: 73, text: 'After.' },
]

const PUSHED: readonly PushedNeighbour[] = [
  { index: 0, side: 'previous', before: { start: 65000, end: 67000 }, after: { start: 65000, end: 67500 } },
]

describe('neighbour', () => {
  it('draws the sentence where the file has it', () => {
    expect(neighbour(CUES, 0, 'previous', [], { start: 68000, end: 70000 }, false)).toEqual({ start: 65000, end: 67000 })
    expect(neighbour(CUES, 2, 'next', [], { start: 68000, end: 70000 }, false)).toEqual({ start: 71000, end: 73000 })
  })

  it('draws a pushed neighbour where the push puts it', () => {
    expect(neighbour(CUES, 0, 'previous', PUSHED, { start: 68000, end: 70000 }, false)).toEqual({
      start: 65000,
      end: 67500,
    })
  })

  it('lets an LRC line end where the edited start begins', () => {
    expect(neighbour(CUES, 0, 'previous', [], { start: 66000, end: 68000 }, true)).toEqual({ start: 65000, end: 66000 })
  })

  it('has no range past an end of the list', () => {
    expect(neighbour(CUES, -1, 'previous', [], { start: 68000, end: 70000 }, false)).toBeNull()
    expect(neighbour(CUES, 3, 'next', [], { start: 68000, end: 70000 }, false)).toBeNull()
  })
})
