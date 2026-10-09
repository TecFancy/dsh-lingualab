import { describe, expect, it } from 'vitest'
import { sameStem, stemOf } from './stem.ts'

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
