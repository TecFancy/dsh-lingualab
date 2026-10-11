import { describe, expect, it } from 'vitest'
import { segmentKey } from '../../../shared/progress.ts'
import type { ProgressEntry } from '../../../shared/protocol.ts'
import {
  continueSegment,
  episodeProgress,
  finishedSegments,
  isFinished,
  newestSegment,
  progressKeyOf,
  type PositionTable,
} from './segments.ts'

const EPISODE = {
  id: 'S01E01',
  segments: [{ id: '01_a' }, { id: '02_b' }, { id: '03_c' }, { id: '10_d' }],
}

const entry = (at: number, duration: number, updatedAt: number): ProgressEntry => ({ at, duration, updatedAt })

/** A table holding the given positions under their segment keys. */
function table(positions: Record<string, ProgressEntry>, bare?: ProgressEntry): PositionTable {
  const keyed = Object.fromEntries(Object.entries(positions).map(([id, value]) => [segmentKey('S01E01', id), value]))
  return bare === undefined ? keyed : { ...keyed, S01E01: bare }
}

describe('progressKeyOf', () => {
  it('is the episode id without a segment and the segment key with one', () => {
    expect(progressKeyOf('S01E01', null)).toBe('S01E01')
    expect(progressKeyOf('S01E01', '02_b')).toBe(segmentKey('S01E01', '02_b'))
  })
})

describe('isFinished', () => {
  it('is true within one second of the end, and not before', () => {
    expect(isFinished(entry(99, 100, 1))).toBe(true)
    expect(isFinished(entry(100, 100, 1))).toBe(true)
    expect(isFinished(entry(98.9, 100, 1))).toBe(false)
  })

  it('is false when there is no position or the length was never known', () => {
    expect(isFinished(null)).toBe(false)
    expect(isFinished(undefined)).toBe(false)
    expect(isFinished(entry(5, 0, 1))).toBe(false)
  })
})

describe('finishedSegments', () => {
  it('counts the segments stored at their end, however many there are', () => {
    const finished = finishedSegments(
      table({ '01_a': entry(60, 60, 1), '02_b': entry(30, 60, 2), '03_c': entry(59.5, 60, 3) }),
      EPISODE,
    )
    expect([...finished]).toEqual(['01_a', '03_c'])
  })

  it('reads the bare episode entry as the first segment until it has its own', () => {
    expect([...finishedSegments(table({}, entry(60, 60, 1)), EPISODE)]).toEqual(['01_a'])
    expect([...finishedSegments(table({ '01_a': entry(10, 60, 2) }, entry(60, 60, 1)), EPISODE)]).toEqual([])
  })

  it('is empty for an episode nobody has listened to', () => {
    expect(finishedSegments({}, EPISODE).size).toBe(0)
  })
})

describe('newestSegment and continueSegment', () => {
  it('is the segment whose position was stored last, not the highest numbered one', () => {
    const progress = table({ '01_a': entry(60, 60, 100), '02_b': entry(10, 60, 300), '10_d': entry(5, 60, 200) })
    expect(newestSegment(progress, EPISODE)).toBe('02_b')
    expect(continueSegment(progress, EPISODE)).toBe('02_b')
  })

  it('moves on past a newest segment that was heard to the end', () => {
    // 01 and 02 finished, 02 last: continuing is 03, not 02 from the top.
    const onward = table({ '01_a': entry(60, 60, 100), '02_b': entry(60, 60, 300) })
    expect(continueSegment(onward, EPISODE)).toBe('03_c')
    // The last segment finished while 02 is still open: wrap to the first unfinished one.
    const wrap = table({ '02_b': entry(20, 60, 100), '10_d': entry(60, 60, 300) })
    expect(continueSegment(wrap, EPISODE)).toBe('01_a')
    // Everything finished: reopen the newest rather than invent a place.
    const done = table({ '01_a': entry(60, 60, 1), '02_b': entry(60, 60, 2), '03_c': entry(60, 60, 4), '10_d': entry(60, 60, 3) })
    expect(continueSegment(done, EPISODE)).toBe('03_c')
  })

  it('opens the first segment when nothing has been listened to', () => {
    expect(newestSegment({}, EPISODE)).toBeNull()
    expect(continueSegment({}, EPISODE)).toBe('01_a')
  })

  it('counts the bare legacy entry as the first segment, and lets a newer segment beat it', () => {
    expect(newestSegment(table({}, entry(30, 60, 50)), EPISODE)).toBe('01_a')
    expect(newestSegment(table({ '03_c': entry(5, 60, 80) }, entry(30, 60, 50)), EPISODE)).toBe('03_c')
  })

  it('keeps the earlier segment on a tie', () => {
    expect(newestSegment(table({ '01_a': entry(5, 60, 7), '02_b': entry(5, 60, 7) }), EPISODE)).toBe('01_a')
  })

  it('has no segment to continue in an episode without segments', () => {
    expect(continueSegment({}, { id: 'E', segments: [] })).toBeNull()
  })

  it('ignores positions of segments the episode no longer has', () => {
    const progress = { ...table({ '01_a': entry(5, 60, 1) }), [segmentKey('S01E01', '99_gone')]: entry(5, 60, 999) }
    expect(newestSegment(progress, EPISODE)).toBe('01_a')
  })
})

describe('episodeProgress', () => {
  it('sums up a segmented episode: finished of total, and the newest position', () => {
    const progress = table({ '01_a': entry(60, 60, 1), '02_b': entry(60, 60, 2), '03_c': entry(12, 80, 3) })
    expect(episodeProgress(progress, EPISODE)).toEqual({
      entry: entry(12, 80, 3),
      segment: '03_c',
      next: '03_c',
      finished: 2,
      total: 4,
      // Two whole segments and 12 of 80 seconds of a third, out of four.
      fraction: (2 + 12 / 80) / 4,
    })
  })

  it('reads 0 of N for a segmented episode nobody started', () => {
    expect(episodeProgress({}, EPISODE)).toEqual({
      entry: null,
      segment: null,
      next: '01_a',
      finished: 0,
      total: 4,
      fraction: 0,
    })
  })

  it('reads the single position of an episode without segments', () => {
    const progress = { E1: entry(30, 60, 5) }
    expect(episodeProgress(progress, { id: 'E1', segments: [] })).toEqual({
      entry: entry(30, 60, 5),
      segment: null,
      next: null,
      finished: 0,
      total: 0,
      fraction: 0.5,
    })
    expect(episodeProgress({}, { id: 'E1', segments: [] }).entry).toBeNull()
  })
})
