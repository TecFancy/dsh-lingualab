// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { isHandPicked, pickOf, pickValue, sameChoice } from './picks.ts'

describe('picks', () => {
  it('round-trips every kind through a select value, a file named auto included', () => {
    for (const pick of [{ kind: 'auto' }, { kind: 'none' }, { kind: 'file', file: 'auto' }, { kind: 'file', file: 'a b.srt' }] as const) {
      expect(pickOf(pickValue(pick))).toEqual(pick)
    }
    expect(pickOf('file:')).toEqual({ kind: 'auto' })
    expect(pickOf('junk')).toEqual({ kind: 'auto' })
  })

  it('tells a hand-made choice from an automatic one', () => {
    expect(isHandPicked(undefined)).toBe(false)
    expect(isHandPicked({ en: { kind: 'auto' }, zh: { kind: 'auto' } })).toBe(false)
    expect(isHandPicked({ en: { kind: 'auto' }, zh: { kind: 'none' } })).toBe(true)
    expect(sameChoice({ en: { kind: 'auto' }, zh: { kind: 'none' } }, { en: { kind: 'auto' }, zh: { kind: 'none' } })).toBe(true)
  })
})
