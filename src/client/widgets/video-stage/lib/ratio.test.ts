import { describe, expect, it } from 'vitest'
import { DEFAULT_RATIO, ratioOf, ratioValue } from './ratio.ts'

describe('ratioOf', () => {
  it('is width over height for a picture', () => {
    expect(ratioOf(1920, 1080)).toBeCloseTo(16 / 9, 6)
    expect(ratioOf(1280, 536)).toBeCloseTo(2.388, 3)
    expect(ratioOf(720, 1280)).toBeCloseTo(0.5625, 4)
  })

  it('says there is no picture when the element reports nothing yet, or an audio file', () => {
    expect(ratioOf(0, 0)).toBeNull()
    expect(ratioOf(1920, 0)).toBeNull()
    expect(ratioOf(0, 1080)).toBeNull()
    expect(ratioOf(Number.NaN, 1080)).toBeNull()
    expect(ratioOf(1920, Number.POSITIVE_INFINITY)).toBeNull()
  })
})

describe('ratioValue', () => {
  it('falls back to 16:9 before the metadata is in', () => {
    expect(DEFAULT_RATIO).toBeCloseTo(16 / 9, 10)
    expect(ratioValue(null)).toBe('1.7778')
  })

  it('writes the real ratio as a plain number with four decimals', () => {
    expect(ratioValue(1)).toBe('1')
    expect(ratioValue(1920 / 800)).toBe('2.4')
    expect(ratioValue(4 / 3)).toBe('1.3333')
  })
})
