import { describe, expect, it } from 'vitest'
import { EDGE_PAD_MS, blockOf, percentAt, timelineWindow } from './timeline.ts'

describe('timelineWindow', () => {
  it('runs from the sentence before to the sentence after', () => {
    const bounds = timelineWindow({ start: 36000, end: 38000 }, { start: 34000, end: 35800 }, { start: 38400, end: 41000 })
    expect(bounds).toEqual({ from: 34000, to: 41000 })
  })

  it('reaches past the range where a side has no neighbour', () => {
    const bounds = timelineWindow({ start: 36000, end: 38000 }, null, null)
    expect(bounds).toEqual({ from: 36000 - EDGE_PAD_MS, to: 38000 + EDGE_PAD_MS })
  })

  it('never starts before the beginning of the audio', () => {
    expect(timelineWindow({ start: 500, end: 2000 }, null, null).from).toBe(0)
  })

  it('keeps the range inside the window when a neighbour overlaps it', () => {
    const bounds = timelineWindow({ start: 36000, end: 38000 }, { start: 37000, end: 39000 }, { start: 30000, end: 31000 })
    expect(bounds).toEqual({ from: 36000, to: 38000 })
  })
})

describe('blocks on the track', () => {
  const bounds = { from: 34000, to: 41000 }

  it('turns times into percentages of the window', () => {
    expect(percentAt(34000, bounds)).toBe(0)
    expect(percentAt(41000, bounds)).toBe(100)
    expect(percentAt(37500, bounds)).toBeCloseTo(50)
  })

  it('holds what is outside the window to its edge', () => {
    expect(percentAt(30000, bounds)).toBe(0)
    expect(percentAt(45000, bounds)).toBe(100)
  })

  it('lays a range out as a left and a width', () => {
    const block = blockOf({ start: 34000, end: 37500 }, bounds)
    expect(block.left).toBe(0)
    expect(block.width).toBeCloseTo(50)
  })

  it('gives a range that ends before it starts no width instead of a negative one', () => {
    expect(blockOf({ start: 38000, end: 37000 }, bounds).width).toBe(0)
  })
})
