import { describe, expect, it } from 'vitest'
import { BIG_STEP_MS, STEP_MS, timingKeyAction } from './keys.ts'

describe('timingKeyAction', () => {
  it('nudges with the arrow keys, and further with Shift held', () => {
    expect(timingKeyAction('ArrowLeft', false)).toEqual({ kind: 'nudge', delta: -STEP_MS })
    expect(timingKeyAction('ArrowRight', false)).toEqual({ kind: 'nudge', delta: STEP_MS })
    expect(timingKeyAction('ArrowLeft', true)).toEqual({ kind: 'nudge', delta: -BIG_STEP_MS })
    expect(timingKeyAction('ArrowRight', true)).toEqual({ kind: 'nudge', delta: BIG_STEP_MS })
  })

  it('steps to the previous and next sentence with the up and down arrows', () => {
    expect(timingKeyAction('ArrowUp', false)).toEqual({ kind: 'step', direction: -1 })
    expect(timingKeyAction('ArrowDown', false)).toEqual({ kind: 'step', direction: 1 })
    expect(timingKeyAction('ArrowUp', true)).toEqual({ kind: 'step', direction: -1 })
  })

  it('reads the fixed keys the same with and without Shift', () => {
    expect(timingKeyAction('Tab', false)).toEqual({ kind: 'switch' })
    expect(timingKeyAction('i', false)).toEqual({ kind: 'toPlayhead', edge: 'start' })
    expect(timingKeyAction('I', true)).toEqual({ kind: 'toPlayhead', edge: 'start' })
    expect(timingKeyAction('o', false)).toEqual({ kind: 'toPlayhead', edge: 'end' })
    expect(timingKeyAction('O', true)).toEqual({ kind: 'toPlayhead', edge: 'end' })
    expect(timingKeyAction(' ', false)).toEqual({ kind: 'toggle' })
    expect(timingKeyAction('Enter', false)).toEqual({ kind: 'save' })
    expect(timingKeyAction('Escape', false)).toEqual({ kind: 'close' })
  })

  it('leaves every other key as a consumed no-op', () => {
    expect(timingKeyAction('l', false)).toEqual({ kind: 'none' })
    expect(timingKeyAction('ArrowUp', false)).not.toEqual({ kind: 'none' })
  })
})
