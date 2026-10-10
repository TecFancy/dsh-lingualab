import { describe, expect, it } from 'vitest'
import { mergeBilingual } from './merge.ts'
import type { Cue } from '../model/types.ts'

const cue = (start: number, text: string): Cue => ({ start, end: start + 2, text })

describe('mergeBilingual', () => {
  it('appends the Chinese line of the matching cue', () => {
    const merged = mergeBilingual([cue(1, 'Hello')], [cue(1.2, '你好')])
    expect(merged[0]?.text).toBe('Hello\n你好')
  })

  it('leaves a cue alone when no Chinese line is close enough', () => {
    const merged = mergeBilingual([cue(1, 'Hello')], [cue(30, '你好')])
    expect(merged[0]?.text).toBe('Hello')
  })

  it('does not shift later lines when one is missing', () => {
    const merged = mergeBilingual(
      [cue(1, 'One'), cue(5, 'Two'), cue(9, 'Three')],
      [cue(1, '一'), cue(9, '三')],
    )
    expect(merged.map((item) => item.text)).toEqual(['One\n一', 'Two', 'Three\n三'])
  })

  it('keeps only the Chinese of a bilingual track so the English is not shown twice', () => {
    const merged = mergeBilingual([cue(1, 'Kids, breakfast!')], [cue(1, '孩子们  吃早饭了\nKids, breakfast!')])
    expect(merged[0]?.text).toBe('Kids, breakfast!\n孩子们  吃早饭了')
  })

  it('drops lines of a mislabelled track that the English already says', () => {
    const merged = mergeBilingual([cue(1, 'Hello')], [cue(1, 'Hello\nHi there')])
    expect(merged[0]?.text).toBe('Hello\nHi there')
    expect(mergeBilingual([cue(1, 'Hello')], [cue(1, 'Hello')])[0]?.text).toBe('Hello')
  })

  it('returns a copy when there is no Chinese track at all', () => {
    const english = [cue(1, 'Hello')]
    const merged = mergeBilingual(english, [])
    expect(merged).toEqual(english)
    expect(merged).not.toBe(english)
  })
})
