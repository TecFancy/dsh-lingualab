/**
 * Where the source list stops fitting, given measured widths: one row, two rows, and the
 * item that only fits by starting a third.
 */
import { describe, expect, it } from 'vitest'
import { fitSources } from './review-sources.ts'

describe('fitSources', () => {
  it('shows everything that fits in one row', () => {
    expect(fitSources([100, 100, 100], 770, 18)).toEqual({ shown: 3, rest: 0 })
  })

  it('wraps to the second row before it stops', () => {
    // 300 + 18 + 300 fits; two rows of two.
    expect(fitSources([300, 300, 300, 300], 770, 18)).toEqual({ shown: 4, rest: 0 })
  })

  it('stops when the next item would need a third row', () => {
    expect(fitSources([300, 300, 300, 300, 300], 770, 18)).toEqual({ shown: 4, rest: 1 })
  })

  it('counts nothing for an empty list', () => {
    expect(fitSources([], 770, 18)).toEqual({ shown: 0, rest: 0 })
  })

  it('shows one item per row when each one alone fills it', () => {
    expect(fitSources([800, 800, 800], 770, 18)).toEqual({ shown: 2, rest: 1 })
  })

  it('honours a different row count', () => {
    expect(fitSources([400, 400, 400], 770, 18, 1)).toEqual({ shown: 1, rest: 2 })
  })
})
