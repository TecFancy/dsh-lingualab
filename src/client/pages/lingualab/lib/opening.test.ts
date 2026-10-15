// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { EpisodeEntry, EpisodeSegment, ProgressEntry } from '../../../shared/protocol.ts'
import { otherSegmentToOpen, segmentForItem, segmentToContinue, startPosition } from './opening.ts'

const segment = (id: string): EpisodeSegment => ({
  id,
  index: 1,
  title: id,
  audio: `${id}.mp3`,
  audioBytes: null,
  subtitleEn: null,
  subtitleZh: null,
  video: null,
})

const entry = (id: string, segmentIds: string[]): EpisodeEntry =>
  ({ id, title: id, segments: segmentIds.map(segment) }) as unknown as EpisodeEntry

const at = (seconds: number, duration = 600, updatedAt = 1): ProgressEntry => ({ at: seconds, duration, updatedAt })

describe('segmentToContinue', () => {
  const cut = entry('E1', ['01_a', '02_b', '03_c'])

  it('is null when nothing is open or the episode has no segments', () => {
    expect(segmentToContinue(null, {})).toBeNull()
    expect(segmentToContinue(entry('E1', []), {})).toBeNull()
  })

  it('opens the first segment when none has been listened to', () => {
    expect(segmentToContinue(cut, {})).toBe('01_a')
  })

  it('opens the segment listened to most recently while it is in progress', () => {
    const positions = { 'E1::01_a': at(100, 600, 5), 'E1::02_b': at(30, 600, 9) }
    expect(segmentToContinue(cut, positions)).toBe('02_b')
  })

  it('moves on to the next segment once the newest one was heard to the end', () => {
    const positions = { 'E1::01_a': at(100, 600, 5), 'E1::02_b': at(599.5, 600, 9) }
    expect(segmentToContinue(cut, positions)).toBe('03_c')
  })
})

describe('startPosition', () => {
  const ids = ['01_a', '02_b']

  it('uses the episode\'s own stored position when there are no segments', () => {
    expect(startPosition('E1', null, [], {}, at(75))).toBe(75)
  })

  it('starts at the top when an episode without segments has no position', () => {
    expect(startPosition('E1', null, [], {}, null)).toBeNull()
  })

  it('uses the opened segment\'s own position', () => {
    expect(startPosition('E1', '02_b', ids, { 'E1::02_b': at(41), 'E1::01_a': at(7) }, null)).toBe(41)
  })

  it('does not read the episode\'s own position for a segment, except for the first one\'s legacy one', () => {
    // Before an episode had segments its single position sat under the bare id; the first segment inherits it.
    expect(startPosition('E1', '01_a', ids, { E1: at(60) }, at(999))).toBe(60)
    expect(startPosition('E1', '02_b', ids, { E1: at(60) }, at(999))).toBeNull()
  })

  it('starts a segment that has none at the top', () => {
    expect(startPosition('E1', '02_b', ids, {}, null)).toBeNull()
  })
})

describe('segmentForItem', () => {
  const cut = entry('E1', ['01_a', '02_b'])

  it('names the segment a review item was kept in', () => {
    expect(segmentForItem(cut, '02_b')).toBe('02_b')
  })

  it('lets the host pick when the item names none', () => {
    expect(segmentForItem(cut, undefined)).toBeUndefined()
  })

  it('lets the host pick when the episode no longer has that segment', () => {
    expect(segmentForItem(cut, '09_gone')).toBeUndefined()
  })

  it('lets the host pick when the episode is not known', () => {
    expect(segmentForItem(null, '02_b')).toBeUndefined()
  })
})

describe('otherSegmentToOpen', () => {
  const segments = [segment('01_a'), segment('02_b')]

  it('names the segment of a sentence that is in another one', () => {
    expect(otherSegmentToOpen({ segment: '02_b' }, '01_a', segments)).toBe('02_b')
    expect(otherSegmentToOpen({ segment: '01_a' }, null, segments)).toBe('01_a')
  })

  it('is null for a sentence in the segment on screen', () => {
    expect(otherSegmentToOpen({ segment: '01_a' }, '01_a', segments)).toBeNull()
  })

  it('is null for a sentence of an episode without segments', () => {
    expect(otherSegmentToOpen({}, '01_a', segments)).toBeNull()
    expect(otherSegmentToOpen({}, null, [])).toBeNull()
  })

  it('is null when the episode no longer has the segment, so the sentence is replayed where it is', () => {
    expect(otherSegmentToOpen({ segment: '09_gone' }, '01_a', segments)).toBeNull()
  })
})
