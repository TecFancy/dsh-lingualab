/**
 * Subtitle pairing: the rule the library scan and the picker share.
 *
 * Two properties are being held down here. Names win when they say something —
 * `en`/`zh` and their regional spellings — and when they do not, a single file's
 * content decides whether it is a bilingual file. The picker's own answer must not
 * read anything, so `subtitleHint` is tested against names whose files do not exist
 * at all: any content read would throw and show up as a different state.
 */
import { rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { classifySubtitles, pairSubtitles, pickAudioFile, sameStem, stemOf, subtitleHint } from './pairing.ts'
import { makeTempDir } from './test-dir.ts'

let root = ''

beforeEach(() => {
  root = makeTempDir('lingualab-pairing-')
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

/** Write one subtitle file with the given body. */
function subtitle(name: string, body = '1\n00:00:01,000 --> 00:00:02,000\nHi there'): void {
  writeFileSync(join(root, name), body)
}

/** Write one audio file. */
function audio(name = 'lesson.mp3'): void {
  writeFileSync(join(root, name), 'audio-bytes')
}

describe('stemOf / sameStem', () => {
  it('reads the stem and keeps sequels apart', () => {
    expect(stemOf('lesson.en.srt')).toBe('lesson.en')
    expect(stemOf('noextension')).toBe('noextension')
    expect(sameStem('lesson.srt', 'lesson')).toBe(true)
    expect(sameStem('lesson.en.srt', 'lesson')).toBe(true)
    expect(sameStem('lesson_zh.srt', 'lesson')).toBe(true)
    expect(sameStem('lesson-2.srt', 'lesson')).toBe(true)
    expect(sameStem('lesson2.srt', 'lesson')).toBe(false)
    expect(sameStem('other.en.srt', 'lesson')).toBe(false)
  })
})

describe('classifySubtitles', () => {
  it('sorts files naturally and splits them by the marks it knows', () => {
    const classified = classifySubtitles([
      'lesson.zh-hans.srt',
      'lesson.mp3',
      'lesson.en-us.srt',
      'lesson.srt',
      'lesson.cn.vtt',
      'lesson.en-gb.srt',
      'notes.md',
    ])
    expect(classified.files).toEqual(['lesson.cn.vtt', 'lesson.en-gb.srt', 'lesson.en-us.srt', 'lesson.srt', 'lesson.zh-hans.srt'])
    expect(classified.zh).toEqual(['lesson.cn.vtt', 'lesson.zh-hans.srt'])
    expect(classified.en).toEqual(['lesson.en-gb.srt', 'lesson.en-us.srt'])
    expect(classified.unmarked).toEqual(['lesson.srt'])
    expect(classified.ambiguous).toBe(true)
  })

  it('treats the near-miss spellings as unmarked rather than guessing', () => {
    const classified = classifySubtitles(['lesson.chs.srt', 'lesson.eng.srt'])
    expect(classified.zh).toEqual([])
    expect(classified.en).toEqual([])
    expect(classified.unmarked).toEqual(['lesson.chs.srt', 'lesson.eng.srt'])
  })

  it('only keeps the files that share the stem', () => {
    const classified = classifySubtitles(['lesson.en.srt', 'en.srt', 'other.zh.srt'], 'lesson')
    expect(classified.en).toEqual(['lesson.en.srt'])
    expect(classified.files).toEqual(['lesson.en.srt'])
  })
})

describe('pairSubtitles', () => {
  it('uses the marks when both languages are spelled out', () => {
    audio()
    subtitle('lesson.en.srt')
    subtitle('lesson.zh.srt')
    expect(pairSubtitles(['lesson.mp3', 'lesson.en.srt', 'lesson.zh.srt'], { directory: root, stem: 'lesson' })).toEqual({
      en: 'lesson.en.srt',
      zh: 'lesson.zh.srt',
      ambiguous: false,
    })
  })

  it('offers one CJK file as both tracks, which is the bilingual case', () => {
    subtitle('双语.srt', '1\n00:00:01,000 --> 00:00:02,000\nKids, breakfast!\n孩子们 吃早饭了')
    const pair = pairSubtitles(['双语.srt'], { directory: root })
    expect(pair.en).toBe('双语.srt')
    expect(pair.zh).toBe('双语.srt')
    expect(pair.ambiguous).toBe(false)
  })

  it('leaves the Chinese track empty when the only file holds no CJK', () => {
    subtitle('lesson.srt')
    expect(pairSubtitles(['lesson.srt'], { directory: root })).toEqual({
      en: 'lesson.srt',
      zh: null,
      ambiguous: false,
    })
  })

  it('lets content decide between two unmarked files', () => {
    subtitle('lesson.chs.srt', '1\n00:00:01,000 --> 00:00:02,000\n孩子们 吃早饭了')
    subtitle('lesson.eng.srt')
    expect(pairSubtitles(['lesson.chs.srt', 'lesson.eng.srt'], { directory: root })).toEqual({
      en: 'lesson.eng.srt',
      zh: 'lesson.chs.srt',
      ambiguous: true,
    })
  })

  it('falls back to order when content cannot tell them apart, and says it guessed', () => {
    subtitle('a.srt')
    subtitle('b.srt')
    const pair = pairSubtitles(['a.srt', 'b.srt'], { directory: root })
    expect(pair).toEqual({ en: 'a.srt', zh: 'b.srt', ambiguous: true })
  })

  it('reports two English marks as ambiguous but still picks one pair', () => {
    subtitle('lesson.en.srt')
    subtitle('lesson.en-gb.srt')
    subtitle('lesson.zh.srt')
    const pair = pairSubtitles(['lesson.en.srt', 'lesson.en-gb.srt', 'lesson.zh.srt'], { directory: root })
    expect(pair.en).toBe('lesson.en-gb.srt')
    expect(pair.zh).toBe('lesson.zh.srt')
    expect(pair.ambiguous).toBe(true)
  })

  it('ignores subtitles that belong to another audio file', () => {
    subtitle('other.en.srt')
    subtitle('other.zh.srt')
    expect(pairSubtitles(['other.en.srt', 'other.zh.srt'], { stem: 'lesson' })).toEqual({
      en: null,
      zh: null,
      ambiguous: false,
    })
  })
})

describe('subtitleHint', () => {
  it('reads nothing: names alone decide, and one unmarked file stays unknown', () => {
    // The directory does not exist, so any read would throw instead of answering.
    const missing = join(root, 'not-there')
    expect(subtitleHint(['lesson.srt'])).toEqual({ state: 'unknown', files: ['lesson.srt'] })
    expect(subtitleHint(['lesson.srt'], 'other')).toEqual({ state: 'none', files: [] })
    expect(pairSubtitles(['lesson.srt'], { directory: missing }).en).toBe('lesson.srt')
  })

  it('names the states the picker shows', () => {
    expect(subtitleHint([])).toEqual({ state: 'none', files: [] })
    expect(subtitleHint(['a.en.srt'])).toEqual({ state: 'en', files: ['a.en.srt'] })
    expect(subtitleHint(['a.zh.srt'])).toEqual({ state: 'zh', files: ['a.zh.srt'] })
    expect(subtitleHint(['a.en.srt', 'a.zh.srt'])).toEqual({ state: 'both', files: ['a.en.srt', 'a.zh.srt'] })
    expect(subtitleHint(['a.en.srt', 'a.srt'])).toEqual({ state: 'both', files: ['a.en.srt', 'a.srt'] })
    expect(subtitleHint(['a.mp3', 'a.srt', 'b.srt'])).toEqual({
      state: 'unknown',
      files: ['a.srt', 'b.srt'],
    })
  })

  it('shows at most four files', () => {
    const names = ['a.en.srt', 'a.zh.srt', 'b.en.srt', 'b.zh.srt', 'c.en.srt', 'c.zh.srt']
    expect(subtitleHint(names).files.length).toBeLessThanOrEqual(4)
  })
})

describe('pickAudioFile', () => {
  it('prefers the first extension in the order the scan documents', () => {
    expect(pickAudioFile(['a.wav', 'a.mp3'])).toBe('a.mp3')
    expect(pickAudioFile(['a.flac', 'a.ogg'])).toBe('a.ogg')
    expect(pickAudioFile(['notes.md'])).toBeNull()
  })
})
