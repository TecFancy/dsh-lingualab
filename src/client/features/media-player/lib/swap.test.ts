import { describe, expect, it } from 'vitest'
import { seekDuringSwap, swapStart, type Loaded } from './swap.ts'

const element = { id: 'video' }
const loaded = (
  src: string | null,
  start = 0,
  session: string | null = 'S01E01',
  pending = false,
): Loaded<typeof element> => ({
  element,
  src,
  session,
  start,
  pending,
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

  it('carries a start that is still waiting, even once the metadata says the element is ready', () => {
    // The video kept 133 s and a step moved its start to 150 s; it is swapped again before the restore ran.
    expect(swapStart(loaded('/a.mp4', 150, 'S01E01', true), { element, src: '/a.mp3', session: 'S01E01' }, ready)).toBe(
      150,
    )
  })
})

describe('seekDuringSwap', () => {
  it('makes a seek the start of a swap still waiting for its metadata', () => {
    expect(seekDuringSwap(loaded('/a.mp4', 22.48, 'S01E01', true), 25.1)).toEqual(loaded('/a.mp4', 25.1, 'S01E01', true))
  })

  it('leaves the seek to the element when no swap is waiting', () => {
    expect(seekDuringSwap(null, 25.1)).toBeNull()
    expect(seekDuringSwap(loaded('/a.mp4', 22.48), 25.1)).toBeNull()
    // The source of another episode starts from the top and waits for nothing.
    expect(seekDuringSwap(loaded('/b.mp3', 0, 'S01E02'), 25.1)).toBeNull()
  })
})
