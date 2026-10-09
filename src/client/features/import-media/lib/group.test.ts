import { describe, expect, it } from 'vitest'
import { kindOf, planDrop, stemOf } from './group.ts'

const name = (file: string): string => file

describe('kindOf', () => {
  it('reads the kind from the extension, case-insensitively', () => {
    expect(kindOf('A.MP3')).toBe('audio')
    expect(kindOf('a.srt')).toBe('subtitle')
    expect(kindOf('a.png')).toBe('other')
    expect(kindOf('README')).toBe('other')
  })
})

describe('stemOf', () => {
  it('drops the last extension only', () => {
    expect(stemOf('lesson.en.srt')).toBe('lesson.en')
    expect(stemOf('plain')).toBe('plain')
    expect(stemOf('.hidden')).toBe('.hidden')
  })
})

describe('planDrop', () => {
  it('pairs each subtitle with the audio file whose stem it starts with', () => {
    const plan = planDrop(['s01e01.mp3', 's01e01.en.srt', 's01e01.zh.srt', 's01e02.mp3', 's01e02.srt'], name)

    expect(plan.groups.map((group) => [group.episode, group.subtitles])).toEqual([
      ['s01e01', ['s01e01.en.srt', 's01e01.zh.srt']],
      ['s01e02', ['s01e02.srt']],
    ])
    expect(plan.unmatched).toEqual([])
  })

  it('does not hand a numbered sequel to the shorter name', () => {
    const plan = planDrop(['lesson.mp3', 'lesson2.mp3', 'lesson2.srt', 'lesson.srt'], name)
    const byEpisode = Object.fromEntries(plan.groups.map((group) => [group.episode, group.subtitles]))
    expect(byEpisode.lesson).toEqual(['lesson.srt'])
    expect(byEpisode.lesson2).toEqual(['lesson2.srt'])
  })

  it('prefers the longest matching stem', () => {
    const plan = planDrop(['lesson.mp3', 'lesson-2.mp3', 'lesson-2.srt'], name)
    const byEpisode = Object.fromEntries(plan.groups.map((group) => [group.episode, group.subtitles]))
    expect(byEpisode['lesson-2']).toEqual(['lesson-2.srt'])
    expect(byEpisode.lesson).toEqual([])
  })

  it('pairs a lone subtitle with a lone audio file whatever they are called', () => {
    const plan = planDrop(['talk.mp3', 'subtitles.srt'], name)
    expect(plan.groups[0]?.subtitles).toEqual(['subtitles.srt'])
    expect(plan.unmatched).toEqual([])
  })

  it('reports a subtitle that fits none of several audio files', () => {
    const plan = planDrop(['a.mp3', 'b.mp3', 'c.srt'], name)
    expect(plan.unmatched).toEqual(['c.srt'])
  })

  it('reports files that are neither audio nor subtitles, and still plans the rest', () => {
    const plan = planDrop(['a.mp3', 'cover.jpg', 'a.srt'], name)
    expect(plan.ignored).toEqual(['cover.jpg'])
    expect(plan.groups).toHaveLength(1)
  })

  it('plans nothing for a drop with no audio', () => {
    const plan = planDrop(['a.srt'], name)
    expect(plan.groups).toEqual([])
    expect(plan.unmatched).toEqual(['a.srt'])
  })
})
