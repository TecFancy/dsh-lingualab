import { describe, expect, it } from 'vitest'
import type { NotePhrase } from '../../../shared/protocol.ts'
import { groupBySegment, type NoteRow } from './group.ts'

const row = (index: number, segment?: string): NoteRow => ({
  index,
  phrase: {
    at: index,
    text: `p${String(index)}`,
    zh: '',
    note: '',
    tags: [],
    done: false,
    ...(segment === undefined ? {} : { segment }),
  } satisfies NotePhrase,
})

const ORDER = ['01_a', '02_b', '10_c']

describe('groupBySegment', () => {
  it('is one group with no heading for an episode without segments', () => {
    const rows = [row(0), row(1)]
    expect(groupBySegment(rows, [])).toEqual([{ segment: undefined, rows }])
    expect(groupBySegment([], [])).toEqual([])
  })

  it('orders the groups by the episode, not by the order the phrases are stored in', () => {
    const groups = groupBySegment([row(0, '10_c'), row(1, '01_a'), row(2, '02_b')], ORDER)
    expect(groups.map((group) => group.segment)).toEqual(['01_a', '02_b', '10_c'])
  })

  it('leaves out a segment with no rows', () => {
    expect(groupBySegment([row(0, '10_c')], ORDER).map((group) => group.segment)).toEqual(['10_c'])
  })

  it('keeps the stored index and the order of the rows inside a group', () => {
    const groups = groupBySegment([row(4, '02_b'), row(1, '01_a'), row(2, '02_b')], ORDER)
    expect(groups[1]?.rows.map((item) => item.index)).toEqual([4, 2])
  })

  it('files a phrase with no segment under the first segment', () => {
    const groups = groupBySegment([row(0), row(1, '02_b')], ORDER)
    expect(groups.map((group) => [group.segment, group.rows.map((item) => item.index)])).toEqual([
      ['01_a', [0]],
      ['02_b', [1]],
    ])
  })

  it('keeps a group for a segment the episode no longer has, after the known ones', () => {
    const groups = groupBySegment([row(0, '99_gone'), row(1, '02_b'), row(2, '98_old')], ORDER)
    expect(groups.map((group) => group.segment)).toEqual(['02_b', '99_gone', '98_old'])
  })

  it('still groups a file that has headings although the episode has no segments now', () => {
    const groups = groupBySegment([row(0, '01_a'), row(1, '01_a')], [])
    expect(groups).toHaveLength(1)
    expect(groups[0]?.segment).toBe('01_a')
  })
})
