import { describe, expect, it } from 'vitest'
import { focusAfterStep, rangeChanged, stepNeedsSave, stepTarget } from './step.ts'

describe('stepTarget', () => {
  it('moves one sentence either way', () => {
    expect(stepTarget(1, -1, 3)).toBe(0)
    expect(stepTarget(1, 1, 3)).toBe(2)
  })

  it('has nowhere to go at either end of the list', () => {
    expect(stepTarget(0, -1, 3)).toBeNull()
    expect(stepTarget(2, 1, 3)).toBeNull()
  })

  it('has nowhere to go in an empty list', () => {
    expect(stepTarget(0, 1, 0)).toBeNull()
    expect(stepTarget(-1, 1, 0)).toBeNull()
  })
})

describe('rangeChanged', () => {
  const base = { start: 68000, end: 70000 }

  it('is false while both edges are where the panel opened them', () => {
    expect(rangeChanged({ start: 68000, end: 70000 }, base)).toBe(false)
  })

  it('is true when either edge moved', () => {
    expect(rangeChanged({ start: 68100, end: 70000 }, base)).toBe(true)
    expect(rangeChanged({ start: 68000, end: 70100 }, base)).toBe(true)
  })
})

describe('stepNeedsSave', () => {
  it('moves an unchanged range without saving', () => {
    expect(stepNeedsSave(null, false)).toBe(false)
  })

  it('saves a changed range first when the episode can be saved', () => {
    expect(stepNeedsSave(null, true)).toBe(true)
  })

  it('moves a changed range at once when the episode cannot be saved', () => {
    expect(stepNeedsSave('outside the library', false)).toBe(false)
    expect(stepNeedsSave('outside the library', true)).toBe(false)
  })
})

describe('focusAfterStep', () => {
  it('keeps the edge that had the focus', () => {
    expect(focusAfterStep('start', true)).toBe('start')
    expect(focusAfterStep('end', true)).toBe('end')
  })

  it('falls back to the start when the end cannot be moved', () => {
    expect(focusAfterStep('end', false)).toBe('start')
    expect(focusAfterStep('start', false)).toBe('start')
  })
})
