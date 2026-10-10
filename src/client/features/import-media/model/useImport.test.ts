// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { folderForSubtitle } from './useImport.ts'

describe('folderForSubtitle', () => {
  const folders = ['S01E01', 'S01E02', 'The Bicycle Thief', 'lesson', 'lesson-2']

  it('finds the folder a subtitle named after the episode belongs to', () => {
    expect(folderForSubtitle('S01E01.zh.srt', folders)).toBe('S01E01')
    expect(folderForSubtitle('S01E02.srt', folders)).toBe('S01E02')
    expect(folderForSubtitle('The Bicycle Thief_en.vtt', folders)).toBe('The Bicycle Thief')
  })

  it('does not hand a numbered sequel to the shorter name', () => {
    // `lesson2.srt` is not a track of `lesson`: the separator is required.
    expect(folderForSubtitle('lesson2.srt', folders)).toBeNull()
  })

  it('prefers the longest folder name that fits', () => {
    expect(folderForSubtitle('lesson-2.srt', folders)).toBe('lesson-2')
    expect(folderForSubtitle('lesson.srt', folders)).toBe('lesson')
  })

  it('answers null for a subtitle that names no episode', () => {
    expect(folderForSubtitle('holiday.srt', folders)).toBeNull()
    expect(folderForSubtitle('S01E03.srt', folders)).toBeNull()
  })

  it('answers null when there are no episodes at all', () => {
    expect(folderForSubtitle('S01E01.srt', [])).toBeNull()
  })

  it('treats the folder name exactly, including case', () => {
    expect(folderForSubtitle('s01e01.srt', folders)).toBeNull()
  })
})
