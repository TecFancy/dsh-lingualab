import { describe, expect, it } from 'vitest'
import { owningStem, sameStem, splitSegmentStem, stemOf } from './stem.ts'

describe('stemOf', () => {
  it('drops the last extension only', () => {
    expect(stemOf('lesson.en.srt')).toBe('lesson.en')
    expect(stemOf('lesson.mp3')).toBe('lesson')
  })

  it('leaves a name with no extension, or only a leading dot, alone', () => {
    expect(stemOf('noextension')).toBe('noextension')
    expect(stemOf('.hidden')).toBe('.hidden')
    expect(stemOf('')).toBe('')
  })

  it('agrees with node:path extname on every shape a media file name takes', async () => {
    const { extname } = await import('node:path')
    for (const name of ['a.mp3', 'a.b.c', '.x', 'x', 'a.', 'a..b', 'The Bicycle Thief.mp3', 'S01E01.zh.srt']) {
      const ext = extname(name)
      expect(stemOf(name), name).toBe(ext.length === 0 ? name : name.slice(0, -ext.length))
    }
  })
})

describe('sameStem', () => {
  it('accepts the track names a subtitle may carry', () => {
    for (const name of ['lesson.srt', 'lesson.en.srt', 'lesson_zh.srt', 'lesson-2.srt', 'lesson.zh-CN.vtt']) {
      expect(sameStem(name, 'lesson'), name).toBe(true)
    }
  })

  it('requires a separator, so a numbered sequel is a different lesson', () => {
    expect(sameStem('lesson2.srt', 'lesson')).toBe(false)
    expect(sameStem('lessons.srt', 'lesson')).toBe(false)
  })

  it('rejects another name entirely, and a stem longer than the file', () => {
    expect(sameStem('other.en.srt', 'lesson')).toBe(false)
    expect(sameStem('les.srt', 'lesson')).toBe(false)
  })

  it('is case sensitive, as the host has always been', () => {
    expect(sameStem('Lesson.srt', 'lesson')).toBe(false)
  })
})

describe('owningStem', () => {
  const stems = ['04_Dunphy家', '04_Dunphy家-Luke射击', '06_Dunphy家-Dylan来了']

  it('gives a subtitle to the longest stem that accepts it', () => {
    expect(owningStem('04_Dunphy家-Luke射击.srt', stems)).toBe('04_Dunphy家-Luke射击')
    expect(owningStem('04_Dunphy家-Luke射击_双语.srt', stems)).toBe('04_Dunphy家-Luke射击')
    expect(owningStem('04_Dunphy家.srt', stems)).toBe('04_Dunphy家')
    expect(owningStem('06_Dunphy家-Dylan来了.en.srt', stems)).toBe('06_Dunphy家-Dylan来了')
  })

  it('does not depend on the order the stems are given in', () => {
    expect(owningStem('04_Dunphy家-Luke射击.srt', [...stems].reverse())).toBe('04_Dunphy家-Luke射击')
  })

  it('answers null when no stem accepts the file', () => {
    expect(owningStem('05_车里.srt', stems)).toBeNull()
    expect(owningStem('04_Dunphy家2.srt', stems)).toBeNull()
    expect(owningStem('a.srt', [])).toBeNull()
  })
})

describe('splitSegmentStem', () => {
  it('takes a leading number and its separator off the title', () => {
    expect(splitSegmentStem('01_Dunphy家的早晨')).toEqual({ number: '01', title: 'Dunphy家的早晨' })
    expect(splitSegmentStem('02-足球场')).toEqual({ number: '02', title: '足球场' })
    expect(splitSegmentStem('03 机场')).toEqual({ number: '03', title: '机场' })
    expect(splitSegmentStem('04.Luke射击')).toEqual({ number: '04', title: 'Luke射击' })
  })

  it('keeps the rest of the stem, hyphens included', () => {
    expect(splitSegmentStem('04_Dunphy家-Luke射击')).toEqual({ number: '04', title: 'Dunphy家-Luke射击' })
  })

  it('falls back to the whole stem when there is no number or nothing after it', () => {
    expect(splitSegmentStem('尾声')).toEqual({ number: null, title: '尾声' })
    expect(splitSegmentStem('10')).toEqual({ number: null, title: '10' })
    expect(splitSegmentStem('10_')).toEqual({ number: null, title: '10_' })
    expect(splitSegmentStem('')).toEqual({ number: null, title: '' })
  })

  it('does not take digits that are part of the name', () => {
    expect(splitSegmentStem('1984')).toEqual({ number: null, title: '1984' })
    expect(splitSegmentStem('S01E01')).toEqual({ number: null, title: 'S01E01' })
  })
})
