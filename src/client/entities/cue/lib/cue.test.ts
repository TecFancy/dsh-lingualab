import { describe, expect, it } from 'vitest'
import { findActiveCue, hasCjk, orderCueLines, visibleCueLines } from './lines.ts'
import { parseLRC, parseSRT, parseSubtitle, parseVTT } from './parse.ts'
import { decodeSubtitleText, stripStyleTags } from './decode.ts'

describe('parseSRT', () => {
  it('reads cues and sorts out-of-order input by start time', () => {
    const text = [
      '2',
      '00:00:12,500 --> 00:00:14,000',
      'Second line',
      '',
      '1',
      '00:00:01,000 --> 00:00:03,250',
      'First line',
    ].join('\n')

    const cues = parseSRT(text)
    expect(cues.map((cue) => cue.text)).toEqual(['First line', 'Second line'])
    expect(cues[0]).toEqual({
      start: 1,
      end: 3.25,
      text: 'First line',
      origin: { start: 1000, end: 3250, occurrence: 0 },
    })
  })

  it('accepts a dot as the millisecond separator and strips style tags', () => {
    const text = ['1', '00:00:01.000 --> 00:00:02.000', '{\\an8}<font color="#fff">Hello</font>\\NWorld'].join('\n')
    const cues = parseSRT(text)
    expect(cues[0]?.text).toBe('Hello\nWorld')
  })

  it('drops a block with no timecode instead of inventing one', () => {
    expect(parseSRT('1\nnot a timecode\nsome text')).toEqual([])
  })
})

describe('parseVTT', () => {
  it('ignores the header, NOTE blocks and cue identifiers', () => {
    const text = [
      'WEBVTT',
      '',
      'NOTE this is a comment',
      'spanning two lines',
      '',
      'cue-1',
      '00:00:01.000 --> 00:00:02.000',
      'Hello there',
    ].join('\n')

    const cues = parseVTT(text)
    expect(cues).toHaveLength(1)
    expect(cues[0]?.text).toBe('Hello there')
  })
})

describe('parseLRC', () => {
  it('chains each end to the next start and gives the last cue a tail', () => {
    const cues = parseLRC('[00:01.00]One\n[00:03.50]Two')
    expect(cues.map((cue) => [cue.start, cue.end])).toEqual([
      [1, 3.5],
      [3.5, 6.5],
    ])
  })

  it('accepts millisecond fractions and minutes past 99', () => {
    const cues = parseLRC('[100:05.200]Late\n[100:07.000]Later')
    expect(cues[0]?.start).toBeCloseTo(6005.2, 3)
  })

  it('ignores metadata tags', () => {
    expect(parseLRC('[ar:Someone]\n[ti:Title]')).toEqual([])
  })
})

describe('parseSubtitle', () => {
  it('picks the parser from the extension', () => {
    expect(parseSubtitle('[00:01.00]One', 'x.lrc')).toHaveLength(1)
    expect(parseSubtitle('WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nHi', 'x.vtt')).toHaveLength(1)
    expect(parseSubtitle('1\n00:00:01,000 --> 00:00:02,000\nHi', 'x.srt')).toHaveLength(1)
  })
})

describe('decodeSubtitleText', () => {
  it('reads UTF-8 with and without a BOM', () => {
    const utf8 = new TextEncoder().encode('你好 world')
    expect(decodeSubtitleText(utf8.buffer as ArrayBuffer)).toBe('你好 world')
    const withBom = new Uint8Array([0xef, 0xbb, 0xbf, ...utf8])
    expect(decodeSubtitleText(withBom.buffer as ArrayBuffer)).toBe('你好 world')
  })

  it('falls back to GB18030 when the bytes are not valid UTF-8', () => {
    // 0xC4 0xE3 0xBA 0xC3 is 你好 in GBK; as UTF-8 it is an invalid sequence.
    const gbk = new Uint8Array([0xc4, 0xe3, 0xba, 0xc3])
    expect(decodeSubtitleText(gbk.buffer as ArrayBuffer)).toBe('你好')
  })
})

describe('stripStyleTags', () => {
  it('removes override blocks, converts hard breaks and drops font tags', () => {
    expect(stripStyleTags('{\\fs16\\an2}A\\NB <i>italic</i>')).toBe('A\nB italic')
    expect(stripStyleTags('a\\hb')).toBe('a b')
  })
})

describe('bilingual line ordering', () => {
  it('puts the English above the Chinese whatever the source order', () => {
    expect(orderCueLines('你太夸张了。\nYou are being dramatic.')).toEqual([
      { text: 'You are being dramatic.', secondary: false },
      { text: '你太夸张了。', secondary: true },
    ])
  })

  it('marks nothing when the cue has only one language', () => {
    expect(orderCueLines('Only English here')).toEqual([{ text: 'Only English here', secondary: false }])
    expect(orderCueLines('只有中文')).toEqual([{ text: '只有中文', secondary: false }])
  })

  it('detects CJK', () => {
    expect(hasCjk('abc')).toBe(false)
    expect(hasCjk('abc中文')).toBe(true)
  })
})

describe('visibleCueLines', () => {
  const bilingual = 'English line\n中文行'

  it('keeps both languages when the mode is always', () => {
    expect(visibleCueLines(bilingual, 'always', false)).toHaveLength(2)
  })

  it('hides the Chinese when the mode says so', () => {
    expect(visibleCueLines(bilingual, 'hidden', true)).toEqual([{ text: 'English line', secondary: false }])
  })

  it('keeps the Chinese only on the active cue', () => {
    expect(visibleCueLines(bilingual, 'active-only', false)).toHaveLength(1)
    expect(visibleCueLines(bilingual, 'active-only', true)).toHaveLength(2)
  })

  it('never blanks a Chinese-only cue', () => {
    expect(visibleCueLines('只有中文', 'hidden', false)).toEqual([{ text: '只有中文', secondary: false }])
  })
})

describe('findActiveCue', () => {
  const cues = [
    { start: 0, end: 2 },
    { start: 5, end: 8 },
    { start: 12, end: 15 },
  ]

  it('finds the covering cue', () => {
    expect(findActiveCue(cues, 6)).toBe(1)
  })

  it('answers -1 before the first cue and the nearest cue in a gap', () => {
    expect(findActiveCue([], 3)).toBe(-1)
    expect(findActiveCue([{ start: 5, end: 8 }], 1)).toBe(-1)
    expect(findActiveCue(cues, 10)).toBe(1)
  })
})
