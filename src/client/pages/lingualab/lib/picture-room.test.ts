// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { PICTURE_BACK, PICTURE_MIN, pictureFits, pictureRoom, stackHeight } from './picture-room.ts'

describe('stackHeight', () => {
  it('adds the children, the gaps between them and the padding', () => {
    expect(stackHeight([30, 100], 14, 24)).toBe(168)
    expect(stackHeight([30, 100, 10], 14, 24)).toBe(30 + 100 + 10 + 28 + 24)
  })

  it('has no gap for one child and only the padding for none', () => {
    expect(stackHeight([100], 14, 24)).toBe(124)
    expect(stackHeight([], 14, 24)).toBe(24)
  })
})

describe('pictureRoom', () => {
  it('is the viewport less the other children and the picture stage padding', () => {
    expect(pictureRoom({ viewport: 651, others: [214, 197], padding: 8 })).toBe(232)
  })

  it('does not depend on anything the picture does, only on what stays', () => {
    const base = { viewport: 600, others: [200, 150], padding: 8 }
    expect(pictureRoom(base)).toBe(pictureRoom({ ...base }))
  })

  it('is zero, never negative, when the others already fill the viewport', () => {
    expect(pictureRoom({ viewport: 300, others: [250, 200], padding: 8 })).toBe(0)
  })

  it('is the whole viewport less the padding when nothing else is there', () => {
    expect(pictureRoom({ viewport: 400, others: [], padding: 8 })).toBe(392)
  })
})

describe('pictureFits', () => {
  it('keeps a drawn picture from 120 and takes it away under that', () => {
    expect(pictureFits(PICTURE_MIN, true)).toBe(true)
    expect(pictureFits(PICTURE_MIN - 1, true)).toBe(false)
  })

  it('brings a picture that stepped aside back only at 128', () => {
    expect(pictureFits(PICTURE_BACK - 1, false)).toBe(false)
    expect(pictureFits(PICTURE_BACK, false)).toBe(true)
    expect(PICTURE_BACK).toBeGreaterThan(PICTURE_MIN)
  })

  it('does not flicker for a room that wobbles inside the band', () => {
    let drawn = true
    const seen: boolean[] = []
    for (const room of [130, 124, 121, 126, 122, 119, 124, 127, 125, 128, 124]) {
      drawn = pictureFits(room, drawn)
      seen.push(drawn)
    }
    // Drawn until 119, away through the band, back at 128, then drawn again for 124.
    expect(seen).toEqual([true, true, true, true, true, false, false, false, false, true, true])
  })
})
