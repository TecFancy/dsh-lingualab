import { describe, expect, it } from 'vitest'
import {
  MAX_PHRASES,
  formatTimestamp,
  gradeOf,
  inPlayOrder,
  parseNotes,
  parseTimestamp,
  phraseCapacity,
  keptSentenceKey,
  sameKeptSentence,
  serializeNotes,
  summarizeNotes,
  withGrade,
  withSegmentDefault,
} from './notes-format.ts'
import type { NotePhrase } from './protocol.ts'

const phrase = (over: Partial<NotePhrase> = {}): NotePhrase => ({
  at: 221,
  text: "I'm not gonna lie...",
  zh: '说实话……',
  note: 'Haley 常用开头',
  tags: ['review'],
  done: false,
  ...over,
})

describe('timestamps', () => {
  it('formats under an hour as mm:ss and beyond it as h:mm:ss', () => {
    expect(formatTimestamp(221)).toBe('03:41')
    expect(formatTimestamp(3661)).toBe('1:01:01')
    expect(formatTimestamp(-5)).toBe('00:00')
  })

  it('parses both shapes back', () => {
    expect(parseTimestamp('03:41')).toBe(221)
    expect(parseTimestamp('1:01:01')).toBe(3661)
    expect(parseTimestamp('nope')).toBeNull()
    expect(parseTimestamp('1:2:3:4')).toBeNull()
  })
})

describe('parseNotes', () => {
  it('reads the canonical line and keeps the preamble', () => {
    const markdown = [
      '# S01E02 笔记',
      '',
      '> 注释保留',
      '',
      '- [ ] 03:41 | I\'m not gonna lie... | 说实话…… | Haley 常用开头 | #review #hard',
      '- [x] 12:07 | That\'s the whole point. | 重点就在这儿。 | Mitchell 怼人 |',
    ].join('\n')

    const { preamble, phrases } = parseNotes(markdown)
    expect(preamble).toContain('> 注释保留')
    expect(phrases).toHaveLength(2)
    expect(phrases[0]).toEqual({
      at: 221,
      text: "I'm not gonna lie...",
      zh: '说实话……',
      note: 'Haley 常用开头',
      tags: ['review', 'hard'],
      done: false,
    })
    expect(phrases[1]?.done).toBe(true)
    expect(phrases[1]?.tags).toEqual([])
  })

  it('skips a checklist line that has no readable timestamp', () => {
    const { phrases } = parseNotes('- [ ] 没有时间戳的一句话\n- [ ] 01:00 | 有时间戳 | 中文 | |')
    expect(phrases).toHaveLength(1)
    expect(phrases[0]?.text).toBe('有时间戳')
  })

  it('returns an empty list for a file with no phrases', () => {
    const { preamble, phrases } = parseNotes('# 空文件\n')
    expect(phrases).toEqual([])
    expect(preamble).toBe('# 空文件')
  })
})

describe('serializeNotes', () => {
  it('round-trips through parse', () => {
    const phrases = [phrase(), phrase({ at: 727, text: "That's the whole point.", tags: [], done: true })]
    const text = serializeNotes('# S01E02 笔记\n\n> 注释', phrases)
    const parsed = parseNotes(text)
    expect(parsed.phrases).toEqual(phrases)
    expect(parsed.preamble).toContain('> 注释')
  })

  it('keeps a field that itself contains the separator', () => {
    const tricky = phrase({ text: 'He said "yes | no" | and left', zh: '他说「行 | 不行」', note: 'a|b' })
    const parsed = parseNotes(serializeNotes('', [tricky]))
    expect(parsed.phrases).toHaveLength(1)
    expect(parsed.phrases[0]?.text).toBe('He said "yes | no" | and left')
    expect(parsed.phrases[0]?.zh).toBe('他说「行 | 不行」')
    expect(parsed.phrases[0]?.note).toBe('a|b')
  })

  it('keeps an empty note in front of the tags, so the tags are not read back as the note', () => {
    const text = serializeNotes('', [phrase({ note: '', tags: ['review', 'hard'] })])
    expect(text).toContain('说实话…… | | #review #hard')
    const [parsed] = parseNotes(text).phrases
    expect(parsed?.note).toBe('')
    expect(parsed?.tags).toEqual(['review', 'hard'])
  })

  it('drops an empty trailing field instead of leaving a dangling pipe', () => {
    const text = serializeNotes('', [phrase({ note: '', tags: [] })])
    expect(text.trim().endsWith('|')).toBe(false)
    expect(text).toContain("I'm not gonna lie... | 说实话……")
  })
})

describe('summaries and capacity', () => {
  it('counts the tags the study method tracks', () => {
    const text = serializeNotes('', [
      phrase({ tags: ['review'] }),
      phrase({ tags: ['hard', 'review'] }),
      phrase({ tags: [] }),
    ])
    expect(summarizeNotes(text)).toEqual({ exists: true, count: 3, review: 2, hard: 1 })
  })

  it('reports a missing file as empty rather than absent data', () => {
    expect(summarizeNotes(null)).toEqual({ exists: false, count: 0, review: 0, hard: 0 })
  })

  it('still recognises a kept sentence after the file has rounded it to whole seconds', () => {
    // The regression this guards: kept at 12.48 s, read back from notes.md as 12.
    const kept = phrase({ at: 12.48, text: 'Hello there' })
    const reloaded = parseNotes(serializeNotes('# E1', [kept])).phrases[0]
    expect(reloaded?.at).toBe(12)
    expect(reloaded).toBeDefined()
    expect(sameKeptSentence(kept, reloaded as NotePhrase)).toBe(true)
  })

  it('does not confuse two sentences that start in the same second', () => {
    expect(sameKeptSentence({ at: 12.1, text: 'Yes.' }, { at: 12.7, text: 'No.' })).toBe(false)
  })

  it('does not match sentences in different seconds, however alike', () => {
    expect(sameKeptSentence({ at: 12.9, text: 'Yes.' }, { at: 13.0, text: 'Yes.' })).toBe(false)
  })

  it('ignores whitespace around the text', () => {
    expect(sameKeptSentence({ at: 5, text: ' Hi ' }, { at: 5.4, text: 'Hi' })).toBe(true)
  })

  it('stops offering room at the method ceiling', () => {
    const full = Array.from({ length: MAX_PHRASES }, (_, index) => phrase({ at: index }))
    expect(phraseCapacity(full)).toEqual({ full: true, remaining: 0 })
    expect(phraseCapacity(full.slice(0, 3))).toEqual({ full: false, remaining: MAX_PHRASES - 3 })
  })
})

describe('segments', () => {
  const ORDER = ['01_Dunphy家的早晨', '02_足球场', '10_尾声']
  const scene = (segment: string, over: Partial<NotePhrase> = {}): NotePhrase => phrase({ segment, ...over })

  const FILE = [
    '# S01E01 笔记',
    '',
    '## 01_Dunphy家的早晨',
    '',
    '- [ ] 00:01 | Kids, breakfast! | 孩子们 吃早饭了 | | #review',
    '',
    '## 02_足球场',
    '',
    '- [ ] 00:09 | He tripped him, Jay. | 他绊倒他了 杰',
    '',
  ].join('\n')

  it('reads the heading above a run of lines as the segment of those lines', () => {
    const { preamble, phrases } = parseNotes(FILE)
    expect(preamble).toBe('# S01E01 笔记')
    expect(phrases.map((item) => [item.segment, item.at])).toEqual([
      ['01_Dunphy家的早晨', 1],
      ['02_足球场', 9],
    ])
  })

  it('ends the preamble at whichever comes first, the first heading or the first phrase line', () => {
    const headingFirst = parseNotes('# T\n\n> 说明\n\n## 01_a\n\n- [ ] 00:05 | Hi | 你好 | |')
    expect(headingFirst.preamble).toBe('# T\n\n> 说明')
    const phraseFirst = parseNotes('# T\n\n- [ ] 00:05 | Hi | 你好 | |\n\n## 01_a\n\n- [ ] 00:06 | Yo | 哟 | |')
    expect(phraseFirst.preamble).toBe('# T')
    expect(phraseFirst.phrases.map((item) => item.segment)).toEqual([undefined, '01_a'])
  })

  it('keeps an H1 title in the preamble and does not mistake it, or an H3, for a segment', () => {
    const { preamble, phrases } = parseNotes('# 01_a\n\n### 02_b\n\n- [ ] 00:05 | Hi | 你好 | |')
    expect(preamble).toContain('# 01_a')
    expect(phrases[0]?.segment).toBeUndefined()
  })

  it('leaves a commentary heading with prose under it in the preamble', () => {
    const { preamble, phrases } = parseNotes(
      '# T\n\n## 个人备注\n\n随便写点\n\n## 01_a\n\n- [ ] 00:05 | Hi | 你好 | |',
    )
    expect(preamble).toContain('## 个人备注')
    expect(preamble).toContain('随便写点')
    expect(phrases[0]?.segment).toBe('01_a')
  })

  it('round-trips a segmented file byte for byte', () => {
    const { preamble, phrases } = parseNotes(FILE)
    expect(serializeNotes(preamble, phrases, ORDER)).toBe(FILE)
  })

  it('writes the groups in the order it is given, not the order the phrases arrive in', () => {
    const text = serializeNotes('# E', [scene('10_尾声', { at: 3 }), scene('02_足球场', { at: 9 }), scene('01_Dunphy家的早晨', { at: 1 })], ORDER)
    expect([...text.matchAll(/^## (.+)$/gm)].map((match) => match[1])).toEqual(ORDER)
  })

  it('keeps a phrase in a segment the list does not know, after the known ones', () => {
    const text = serializeNotes('', [scene('99_改过名', { at: 4 }), scene('02_足球场', { at: 9 })], ORDER)
    expect([...text.matchAll(/^## (.+)$/gm)].map((match) => match[1])).toEqual(['02_足球场', '99_改过名'])
  })

  it('keeps the order of phrases inside one segment', () => {
    const text = serializeNotes('', [scene('02_足球场', { at: 30, text: 'later' }), scene('01_Dunphy家的早晨', { at: 5 }), scene('02_足球场', { at: 8, text: 'earlier' })], ORDER)
    const second = parseNotes(text).phrases.filter((item) => item.segment === '02_足球场')
    expect(second.map((item) => item.text)).toEqual(['later', 'earlier'])
  })

  it('files phrases without a segment under the first one when the episode has segments', () => {
    const text = serializeNotes('# E', [phrase({ at: 7 }), scene('02_足球场', { at: 9 })], ORDER)
    const phrases = parseNotes(text).phrases
    expect(phrases.map((item) => [item.segment, item.at])).toEqual([
      ['01_Dunphy家的早晨', 7],
      ['02_足球场', 9],
    ])
  })

  it('round-trips an old file without headings unchanged when the episode has no segments', () => {
    const legacy = '# S01E02 笔记\n\n> 注释\n\n- [ ] 03:41 | A | 甲 | n | #review\n- [x] 12:07 | B | 乙\n'
    const { preamble, phrases } = parseNotes(legacy)
    expect(phrases.every((item) => item.segment === undefined)).toBe(true)
    expect(serializeNotes(preamble, phrases)).toBe(legacy)
  })

  it('keeps the escaping of a pipe working under a heading', () => {
    const tricky = scene('02_足球场', { text: 'yes | no', zh: '行 | 不行', note: 'a|b' })
    const parsed = parseNotes(serializeNotes('', [tricky], ORDER)).phrases[0]
    expect(parsed).toEqual({ ...tricky, at: 221 })
  })

  it('counts every segment in the summary', () => {
    expect(summarizeNotes(FILE)).toEqual({ exists: true, count: 2, review: 1, hard: 0 })
  })

  it('gives unsegmented phrases a default and hands back the same array when nothing changes', () => {
    const flat = [phrase()]
    expect(withSegmentDefault(flat, '01_a')[0]?.segment).toBe('01_a')
    expect(withSegmentDefault(flat, undefined)).toBe(flat)
    const tagged = [scene('02_b')]
    expect(withSegmentDefault(tagged, '01_a')).toBe(tagged)
  })

  it('tells the same second and text apart by segment', () => {
    const one = { at: 2, text: 'Kids?', segment: '01_a' }
    const two = { at: 2.4, text: 'Kids?', segment: '02_b' }
    expect(sameKeptSentence(one, two)).toBe(false)
    expect(sameKeptSentence(one, { ...two, segment: '01_a' })).toBe(true)
    expect(keptSentenceKey(one)).not.toBe(keptSentenceKey(two))
    // No segment is its own value: an episode without segments keeps matching as before.
    expect(sameKeptSentence({ at: 2, text: 'Kids?' }, { at: 2.9, text: 'Kids?' })).toBe(true)
  })
})

describe('grades', () => {
  it('reads one state per line, the tick first and #hard over #review', () => {
    expect(gradeOf(phrase({ done: false, tags: [] }))).toBe('new')
    expect(gradeOf(phrase({ done: false, tags: ['review'] }))).toBe('fuzzy')
    expect(gradeOf(phrase({ done: false, tags: ['hard'] }))).toBe('notyet')
    expect(gradeOf(phrase({ done: false, tags: ['review', 'hard'] }))).toBe('notyet')
    expect(gradeOf(phrase({ done: true, tags: ['hard'] }))).toBe('got')
  })

  it('replaces the previous state and keeps tags written by hand', () => {
    const marked = phrase({ done: false, tags: ['review', 'scene', 'hard'] })
    expect(withGrade(marked, 'got')).toMatchObject({ done: true, tags: ['scene'] })
    expect(withGrade(marked, 'fuzzy')).toMatchObject({ done: false, tags: ['scene', 'review'] })
    expect(withGrade(phrase({ done: true, tags: [] }), 'notyet')).toMatchObject({ done: false, tags: ['hard'] })
  })

  it('writes a grade the way the file has always carried it', () => {
    const body = serializeNotes('', [withGrade(phrase({ tags: [] }), 'notyet'), withGrade(phrase({ at: 300 }), 'got')])
    const lines = body.trim().split(String.fromCharCode(10))
    expect(lines[0]).toMatch(/^- \[ \] .* \| #hard$/)
    expect(lines[1]).toMatch(/^- \[x\] /)
    expect(parseNotes(body).phrases.map(gradeOf)).toEqual(['notyet', 'got'])
  })
})

describe('inPlayOrder', () => {
  const at = (seconds: number, segment?: string): Pick<NotePhrase, 'at' | 'segment'> =>
    segment === undefined ? { at: seconds } : { at: seconds, segment }

  it('orders by time in an episode without segments', () => {
    expect(inPlayOrder([at(30), at(4), at(12)], []).map((item) => item.at)).toEqual([4, 12, 30])
  })

  it('orders by segment, then time, with no segment meaning the first', () => {
    const sorted = inPlayOrder([at(1, '02_b'), at(9, '01_a'), at(3), at(2, '01_a')], ['01_a', '02_b'])
    expect(sorted.map((item) => [item.segment, item.at])).toEqual([
      ['01_a', 2],
      [undefined, 3],
      ['01_a', 9],
      ['02_b', 1],
    ])
  })

  it('puts a segment the episode no longer has after the known ones, in first-seen order', () => {
    const sorted = inPlayOrder([at(1, 'zz'), at(5, 'yy'), at(2, '02_b'), at(0, 'zz')], ['01_a', '02_b'])
    expect(sorted.map((item) => [item.segment, item.at])).toEqual([
      ['02_b', 2],
      ['zz', 0],
      ['zz', 1],
      ['yy', 5],
    ])
  })
})
