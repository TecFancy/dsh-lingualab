import { describe, expect, it } from 'vitest'
import type { Cue } from '../model/types.ts'
import { mergeBilingual } from './merge.ts'
import { parseLRC, parseSRT } from './parse.ts'
import { initialRange, moveEdge, retimeLimits, timingEdits } from './retime.ts'

const SRT = [
  '1',
  '00:00:01,000 --> 00:00:02,000',
  'One.',
  '',
  '2',
  '00:00:03,000 --> 00:00:04,500',
  'Two.',
  '',
  '3',
  '00:00:05,000 --> 00:00:06,000',
  'Three.',
].join('\n')

describe('where each cue came from', () => {
  it('records the exact milliseconds and numbers repeated ranges in file order', () => {
    const cues = parseSRT(
      ['00:00:01,000 --> 00:00:02,000', 'a', '', '00:00:01,000 --> 00:00:02,000', '', '00:00:01,000 --> 00:00:02,000', 'c'].join('\n'),
    )
    // The middle block has no text and is dropped, but it is still the second at that range.
    expect(cues.map((cue) => [cue.text, cue.origin?.occurrence])).toEqual([
      ['a', 0],
      ['c', 2],
    ])
  })

  it('reads a three-digit LRC fraction as milliseconds and a two-digit one as centiseconds', () => {
    const cues = parseLRC('[00:01.050]a\n[00:02.05]b')
    expect(cues.map((cue) => [cue.start, cue.origin?.start])).toEqual([
      [1.05, 1050],
      [2.05, 2050],
    ])
  })

  it('carries the Chinese cue it folded in', () => {
    const english = parseSRT(SRT)
    const chinese = parseSRT('1\n00:00:03,100 --> 00:00:04,400\n二。')
    const merged = mergeBilingual(english, chinese)
    expect(merged[1]?.zhOrigin).toEqual({ start: 3100, end: 4400, occurrence: 0 })
    expect(merged[0]?.zhOrigin).toBeUndefined()
  })
})

describe('retimeLimits and moveEdge', () => {
  const cues = parseSRT(SRT)
  const limits = retimeLimits(cues, 1, false, 10_000)

  it('keeps each edge between the neighbours', () => {
    expect(limits).toMatchObject({ minStart: 2000, maxEnd: 5000, endEditable: true })
    const range = initialRange(cues[1] as Cue)
    expect(moveEdge(range, 'start', 1500, limits)).toEqual({ start: 2000, end: 4500 })
    expect(moveEdge(range, 'end', 5600, limits)).toEqual({ start: 3000, end: 5000 })
  })

  it('never makes a cue shorter than 200 ms', () => {
    const range = { start: 3000, end: 4500 }
    expect(moveEdge(range, 'start', 4450, limits)).toEqual({ start: 4300, end: 4500 })
    expect(moveEdge(range, 'end', 3050, limits)).toEqual({ start: 3000, end: 3200 })
  })

  it('keeps an overlap the file already had instead of refusing to move', () => {
    const overlapping = parseSRT('00:00:01,000 --> 00:00:03,500\na\n\n00:00:03,000 --> 00:00:04,000\nb')
    expect(retimeLimits(overlapping, 1, false, null).minStart).toBe(3000)
  })

  it('moves only the start of an LRC line, clear of both neighbours', () => {
    const lrc = parseLRC('[00:01.00]a\n[00:03.00]b\n[00:05.00]c')
    const lrcLimits = retimeLimits(lrc, 1, true, null)
    expect(lrcLimits).toMatchObject({ minStart: 1200, maxStart: 4800, endEditable: false })
    const range = initialRange(lrc[1] as Cue)
    expect(range).toEqual({ start: 3000, end: 5000 })
    expect(moveEdge(range, 'end', 4000, lrcLimits)).toBe(range)
    expect(moveEdge(range, 'start', 100, lrcLimits)).toEqual({ start: 1200, end: 5000 })
  })
})

describe('timingEdits', () => {
  const english = { file: 'a.en.srt', hash: 'e'.repeat(64) }
  const chinese = { file: 'a.zh.srt', hash: 'z'.repeat(64) }

  it('moves the Chinese cue by the same amount, keeping its own offset', () => {
    const merged = mergeBilingual(parseSRT(SRT), parseSRT('00:00:03,100 --> 00:00:04,400\n二。'))
    const edits = timingEdits(merged[1] as Cue, { start: 2800, end: 4700 }, english, chinese)
    expect(edits).toEqual([
      { file: 'a.en.srt', from: { start: 3000, end: 4500, occurrence: 0 }, to: { start: 2800, end: 4700 }, expect: english.hash },
      { file: 'a.zh.srt', from: { start: 3100, end: 4400, occurrence: 0 }, to: { start: 2900, end: 4600 }, expect: chinese.hash },
    ])
  })

  it('writes one edit for a cue with no separate Chinese, and none for a cue without an origin', () => {
    const cues = parseSRT(SRT)
    expect(timingEdits(cues[0] as Cue, { start: 900, end: 2000 }, english, null)).toHaveLength(1)
    expect(timingEdits({ start: 1, end: 2, text: 'x' }, { start: 900, end: 2000 }, english, null)).toBeNull()
  })

  it('sends a start only for LRC', () => {
    const lrc = parseLRC('[00:01.00]a\n[00:03.00]b')
    expect(timingEdits(lrc[0] as Cue, { start: 1300, end: 3000 }, { file: 'a.lrc', hash: 'h' }, null)).toEqual([
      { file: 'a.lrc', from: { start: 1000, end: 1000, occurrence: 0 }, to: { start: 1300, end: 1300 }, expect: 'h' },
    ])
  })
})
