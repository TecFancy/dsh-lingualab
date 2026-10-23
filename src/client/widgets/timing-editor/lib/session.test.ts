import { describe, expect, it } from 'vitest'
import type { Cue } from '../../../entities/cue/index.ts'
import { timingSession } from './session.ts'

const cues: Cue[] = [
  { start: 1, end: 2, text: 'One', origin: { start: 1000, end: 2000, occurrence: 0 } },
  { start: 3, end: 4.5, text: 'Two', origin: { start: 3000, end: 4500, occurrence: 0 } },
  { start: 5, end: 6, text: 'Three', origin: { start: 5000, end: 6000, occurrence: 0 } },
]

describe('timingSession', () => {
  it('knows where a step has nowhere to go', () => {
    expect(timingSession(0, { start: 1000, end: 2000 }, 'start', cues, false, 10_000)).toMatchObject({
      canStepPrevious: false,
      canStepNext: true,
    })
    expect(timingSession(2, { start: 5000, end: 6000 }, 'start', cues, false, 10_000)).toMatchObject({
      canStepPrevious: true,
      canStepNext: false,
    })
  })

  it('opens on the cue edges and shows the neighbours as they stand', () => {
    const session = timingSession(1, { start: 3000, end: 4500 }, 'start', cues, false, 10_000)
    expect(session).toMatchObject({
      index: 1,
      range: { start: 3000, end: 4500 },
      base: { start: 3000, end: 4500 },
      previous: { start: 1000, end: 2000 },
      next: { start: 5000, end: 6000 },
      lrc: false,
    })
  })

  it('draws a pushed neighbour where the push lands it', () => {
    const session = timingSession(1, { start: 2800, end: 5300 }, 'end', cues, false, 10_000)
    expect(session?.pushed.map((neighbour) => neighbour.side)).toEqual(['next'])
    expect(session?.next).toEqual({ start: 5300, end: 6000 })
  })

  it('is null when the index is not a sentence of this list', () => {
    expect(timingSession(9, { start: 0, end: 1 }, 'start', cues, false, 10_000)).toBeNull()
  })
})
