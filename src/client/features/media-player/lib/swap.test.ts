import { describe, expect, it } from 'vitest'
import { swapStart, type Loaded } from './swap.ts'

const element = { id: 'video' }
const loaded = (src: string | null, start = 0, session: string | null = 'S01E01'): Loaded<typeof element> => ({
  element,
  src,
  session,
  start,
})
const ready = { readyState: 4, currentTime: 133 }
const empty = { readyState: 0, currentTime: 0 }

describe('swapStart', () => {
  it('keeps the position when the source is swapped under the same session', () => {
    expect(swapStart(loaded('/a.mp3'), { element, src: '/a.mp4', session: 'S01E01' }, ready)).toBe(133)
  })

  it('starts from the top for the first source, another session or another element', () => {
    expect(swapStart(null, { element, src: '/a.mp4', session: 'S01E01' }, ready)).toBe(0)
    expect(swapStart(loaded('/a.mp3'), { element, src: '/b.mp4', session: 'S01E02' }, ready)).toBe(0)
    expect(swapStart(loaded('/a.mp3'), { element: { id: 'other' }, src: '/a.mp4', session: 'S01E01' }, ready)).toBe(0)
  })

  it('starts from the top when nothing is swapped in or out', () => {
    expect(swapStart(loaded(null), { element, src: '/a.mp4', session: 'S01E01' }, ready)).toBe(0)
    expect(swapStart(loaded('/a.mp4'), { element, src: null, session: 'S01E01' }, ready)).toBe(0)
    expect(swapStart(loaded('/a.mp4'), { element, src: '/a.mp4', session: 'S01E01' }, ready)).toBe(0)
  })

  it('carries the start of a source that never loaded, whose load reset the position to 0', () => {
    // The served video at 133 s, a local file that cannot be opened, then the served video again.
    const failed = loaded('blob:local', 133)
    expect(swapStart(failed, { element, src: '/a.mp4', session: 'S01E01' }, empty)).toBe(133)
  })
})
