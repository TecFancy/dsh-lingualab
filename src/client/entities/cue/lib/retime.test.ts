import { describe, expect, it } from 'vitest'
import type { Cue } from '../model/types.ts'
import { mergeBilingual } from './merge.ts'
import { parseLRC, parseSRT } from './parse.ts'
import { initialRange, moveEdge, pushedNeighbours, retimeLimits, timingEdits } from './retime.ts'

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

  it('lets an edge push into a neighbour as far as leaves it 200 ms', () => {
    expect(limits).toMatchObject({ minStart: 1200, maxEnd: 5800, endEditable: true })
    const range = initialRange(cues[1] as Cue)
    expect(moveEdge(range, 'start', 500, limits)).toEqual({ start: 1200, end: 4500 })
    expect(moveEdge(range, 'end', 6600, limits)).toEqual({ start: 3000, end: 5800 })
  })

  it('moves the shared edge of a neighbour only when an edge is pushed past it', () => {
    expect(pushedNeighbours(cues, 1, { start: 2500, end: 4500 }, false)).toEqual([])
    expect(pushedNeighbours(cues, 1, { start: 1800, end: 5300 }, false)).toEqual([
      { index: 0, side: 'previous', before: { start: 1000, end: 2000 }, after: { start: 1000, end: 1800 } },
      { index: 2, side: 'next', before: { start: 5000, end: 6000 }, after: { start: 5300, end: 6000 } },
    ])
    // A start moved later inside an overlap the file already had leaves the previous cue alone.
    const overlapping = parseSRT('00:00:01,000 --> 00:00:03,500\na\n\n00:00:03,000 --> 00:00:04,000\nb')
    expect(pushedNeighbours(overlapping, 1, { start: 3200, end: 4000 }, false)).toEqual([])
    expect(pushedNeighbours(overlapping, 1, { start: 2800, end: 4000 }, false)[0]?.after).toEqual({ start: 1000, end: 2800 })
    expect(pushedNeighbours(parseLRC('[00:01.00]a\n[00:03.00]b'), 1, { start: 1500, end: 3000 }, true)).toEqual([])
  })

  it('never makes a cue shorter than 200 ms', () => {
    const range = { start: 3000, end: 4500 }
    expect(moveEdge(range, 'start', 4450, limits)).toEqual({ start: 4300, end: 4500 })
    expect(moveEdge(range, 'end', 3050, limits)).toEqual({ start: 3000, end: 3200 })
  })

  it('keeps a cue where it is when the previous one leaves no room to push', () => {
    const overlapping = parseSRT('00:00:01,000 --> 00:00:03,500\na\n\n00:00:01,100 --> 00:00:04,000\nb')
    expect(retimeLimits(overlapping, 1, false, null).minStart).toBe(1100)
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
    const edits = timingEdits(merged, 1, { start: 2800, end: 4700 }, english, chinese)
    expect(edits).toEqual([
      { file: 'a.en.srt', from: { start: 3000, end: 4500, occurrence: 0 }, to: { start: 2800, end: 4700 }, expect: english.hash },
      { file: 'a.zh.srt', from: { start: 3100, end: 4400, occurrence: 0 }, to: { start: 2900, end: 4600 }, expect: chinese.hash },
    ])
  })

  it('writes the pushed neighbour too, and its Chinese only as far as clears the sentence', () => {
    const backToBack = '00:00:01,000 --> 00:00:03,000\nOne.\n\n00:00:03,000 --> 00:00:05,000\nTwo.'
    const zh = '00:00:01,000 --> 00:00:02,900\n一。\n\n00:00:02,950 --> 00:00:05,000\n二。'
    const merged = mergeBilingual(parseSRT(backToBack), parseSRT(zh))
    expect(timingEdits(merged, 1, { start: 2500, end: 5000 }, english, chinese)).toEqual([
      { file: 'a.en.srt', from: { start: 3000, end: 5000, occurrence: 0 }, to: { start: 2500, end: 5000 }, expect: english.hash },
      { file: 'a.en.srt', from: { start: 1000, end: 3000, occurrence: 0 }, to: { start: 1000, end: 2500 }, expect: english.hash },
      { file: 'a.zh.srt', from: { start: 2950, end: 5000, occurrence: 0 }, to: { start: 2450, end: 5000 }, expect: chinese.hash },
      { file: 'a.zh.srt', from: { start: 1000, end: 2900, occurrence: 0 }, to: { start: 1000, end: 2450 }, expect: chinese.hash },
    ])
    // A small push the Chinese gap already covers leaves the previous Chinese where it is.
    expect(timingEdits(merged, 1, { start: 2980, end: 5000 }, english, chinese)).toHaveLength(3)
  })

  it('writes one edit for a cue with no separate Chinese, and none for a cue without an origin', () => {
    const cues = parseSRT(SRT)
    expect(timingEdits(cues, 0, { start: 900, end: 2000 }, english, null)).toHaveLength(1)
    expect(timingEdits([{ start: 1, end: 2, text: 'x' }], 0, { start: 900, end: 2000 }, english, null)).toBeNull()
  })

  it('sends a start only for LRC', () => {
    const lrc = parseLRC('[00:01.00]a\n[00:03.00]b')
    expect(timingEdits(lrc, 0, { start: 1300, end: 3000 }, { file: 'a.lrc', hash: 'h' }, null)).toEqual([
      { file: 'a.lrc', from: { start: 1000, end: 1000, occurrence: 0 }, to: { start: 1300, end: 1300 }, expect: 'h' },
    ])
  })
})
