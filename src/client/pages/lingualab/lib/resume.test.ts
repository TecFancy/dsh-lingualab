// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { Cue } from '../../../entities/cue/index.ts'
import type { EpisodeMedia } from '../../../shared/protocol.ts'
import { canBookmark, canMarkFinished, cuesAreReady, keptCueStart, resumeSeek } from './resume.ts'

const cue = (start: number, text: string): Cue => ({ start, end: start + 2, text })

describe('keptCueStart', () => {
  const cues = [cue(130.5, 'Almost there'), cue(135.08, 'You made it\n你做到了'), cue(140, 'Well done')]

  it('lands on the cue itself, not on the whole second the notes file holds', () => {
    expect(keptCueStart(cues, 135, 'You made it')).toBe(135.08)
  })

  it('tells sentences of the same second apart by their English', () => {
    const crowded = [cue(10.1, 'First'), cue(10.6, 'Second')]
    expect(keptCueStart(crowded, 10, 'Second')).toBe(10.6)
    expect(keptCueStart(crowded, 10, 'First')).toBe(10.1)
  })

  it('falls back to the second it was given when no cue matches', () => {
    expect(keptCueStart(cues, 135, 'Something else')).toBe(135)
    expect(keptCueStart(cues, 200, 'You made it')).toBe(200)
    expect(keptCueStart([], 12, 'Anything')).toBe(12)
  })
})

describe('cuesAreReady', () => {
  const media = (en: string | null, zh: string | null): EpisodeMedia => ({ audioUrl: '/a.mp3', subtitleEnUrl: en, subtitleZhUrl: zh })

  it('is ready once there are cues', () => {
    expect(cuesAreReady(3, media('/en.srt', null))).toBe(true)
    expect(cuesAreReady(1, null)).toBe(true)
  })

  it('waits for the cues of a subtitled episode that are still being read', () => {
    expect(cuesAreReady(0, media('/en.srt', null))).toBe(false)
    expect(cuesAreReady(0, media(null, '/zh.srt'))).toBe(false)
    expect(cuesAreReady(0, media('/en.srt', '/zh.srt'))).toBe(false)
  })

  it('does not wait for subtitles an episode does not have', () => {
    expect(cuesAreReady(0, media(null, null))).toBe(true)
  })

  it('waits while nothing is open at all', () => {
    expect(cuesAreReady(0, null)).toBe(false)
  })
})

describe('resumeSeek', () => {
  const cues = [cue(135.08, 'You made it')]

  it('seeks to the second it was asked for', () => {
    expect(resumeSeek(42, false, null, cues, 600)).toEqual({ at: 42, loop: false })
  })

  it('carries the loop of a replayed sentence along', () => {
    expect(resumeSeek(42, true, null, cues, 600)).toEqual({ at: 42, loop: true })
  })

  it('lands on the cue of a replayed note, not on its whole second', () => {
    expect(resumeSeek(135, true, 'You made it', cues, 600)).toEqual({ at: 135.08, loop: true })
  })

  it('starts over when the bookmark is within a second of the end, or past it', () => {
    expect(resumeSeek(599, false, null, cues, 600)).toBeNull()
    expect(resumeSeek(600, false, null, cues, 600)).toBeNull()
    expect(resumeSeek(900, true, null, cues, 600)).toBeNull()
    expect(resumeSeek(598.9, false, null, cues, 600)).toEqual({ at: 598.9, loop: false })
  })

  it('judges the end by the cue a note lands on', () => {
    expect(resumeSeek(135, true, 'You made it', cues, 136)).toBeNull()
  })

  it('seeks when the length is not known yet', () => {
    expect(resumeSeek(42, false, null, cues, Number.NaN)).toEqual({ at: 42, loop: false })
    expect(resumeSeek(42, false, null, cues, Number.POSITIVE_INFINITY)).toEqual({ at: 42, loop: false })
  })
})

describe('canBookmark', () => {
  it('writes only when no resume is waiting and no review is moving the position', () => {
    expect(canBookmark(false, false)).toBe(true)
    expect(canBookmark(true, false)).toBe(false)
    expect(canBookmark(false, true)).toBe(false)
    expect(canBookmark(true, true)).toBe(false)
  })
})

describe('canMarkFinished', () => {
  it('writes the end only in the practice view, with a known length, outside a review', () => {
    expect(canMarkFinished('practice', 120, false)).toBe(true)
    expect(canMarkFinished('home', 120, false)).toBe(false)
    expect(canMarkFinished('practice', 0, false)).toBe(false)
    expect(canMarkFinished('practice', 120, true)).toBe(false)
  })
})
