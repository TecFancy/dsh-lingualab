import { describe, expect, it } from 'vitest'
import type { EpisodeSegment } from '../../../shared/protocol.ts'
import { findSegment, nextSegment, segmentLabel, segmentNumber } from './segments.ts'

const segment = (id: string, index: number, title: string): EpisodeSegment => ({
  id,
  index,
  title,
  audio: `${id}.mp3`,
  audioBytes: 1,
  subtitleEn: null,
  subtitleZh: null,
  video: null,
})

const SEGMENTS = [
  segment('01_Dunphy家的早晨', 1, 'Dunphy家的早晨'),
  segment('02_足球场', 2, '足球场'),
  segment('10_尾声', 3, '尾声'),
]

describe('segmentNumber and segmentLabel', () => {
  it('shows the number written in the stem, so the page and the folder agree', () => {
    expect(segmentNumber(SEGMENTS[2] as EpisodeSegment)).toBe('10')
    expect(segmentLabel(SEGMENTS[0] as EpisodeSegment)).toBe('01 · Dunphy家的早晨')
    expect(segmentLabel(SEGMENTS[2] as EpisodeSegment)).toBe('10 · 尾声')
  })

  it('falls back to the position, two digits wide, when the stem has no number', () => {
    expect(segmentLabel(segment('Epilogue', 7, 'Epilogue'))).toBe('07 · Epilogue')
  })

  it('keeps hyphens that belong to the title', () => {
    expect(segmentLabel(segment('04_Dunphy家-Luke射击', 4, 'Dunphy家-Luke射击'))).toBe('04 · Dunphy家-Luke射击')
  })
})

describe('findSegment', () => {
  it('finds by id, and answers null for no id or an unknown one', () => {
    expect(findSegment(SEGMENTS, '02_足球场')?.index).toBe(2)
    expect(findSegment(SEGMENTS, null)).toBeNull()
    expect(findSegment(SEGMENTS, 'nope')).toBeNull()
  })
})

describe('nextSegment', () => {
  it('is the one after, in list order', () => {
    expect(nextSegment(SEGMENTS, '01_Dunphy家的早晨')?.id).toBe('02_足球场')
    expect(nextSegment(SEGMENTS, '02_足球场')?.id).toBe('10_尾声')
  })

  it('is null for the last segment, for an unknown id and for no segments at all', () => {
    expect(nextSegment(SEGMENTS, '10_尾声')).toBeNull()
    expect(nextSegment(SEGMENTS, 'nope')).toBeNull()
    expect(nextSegment(SEGMENTS, null)).toBeNull()
    expect(nextSegment([], 'a')).toBeNull()
  })
})
