import { describe, expect, it } from 'vitest'
import {
  MAX_PHRASES,
  formatTimestamp,
  parseNotes,
  parseTimestamp,
  phraseCapacity,
  serializeNotes,
  summarizeNotes,
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

  it('stops offering room at the method ceiling', () => {
    const full = Array.from({ length: MAX_PHRASES }, (_, index) => phrase({ at: index }))
    expect(phraseCapacity(full)).toEqual({ full: true, remaining: 0 })
    expect(phraseCapacity(full.slice(0, 3))).toEqual({ full: false, remaining: MAX_PHRASES - 3 })
  })
})
