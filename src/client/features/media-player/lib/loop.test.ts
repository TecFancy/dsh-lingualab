import { describe, expect, it } from 'vitest'
import { loopWindow, planLoop, stepCueIndex, type LoopInput } from './loop.ts'

const base: LoopInput = {
  time: 0,
  mode: 'sentence',
  cueStart: 10,
  cueEnd: 14,
  pointA: null,
  pointB: null,
  repeats: 0,
  playsDone: 0,
}

describe('loopWindow', () => {
  it('uses the sentence bounds in sentence mode', () => {
    expect(loopWindow({ ...base })).toEqual({ start: 10, end: 14 })
  })

  it('uses the A-B points in ab mode', () => {
    expect(
      loopWindow({ ...base, mode: 'ab', pointA: 3, pointB: 9 }),
    ).toEqual({ start: 3, end: 9 })
  })

  it('has no window when the mode is off or the bounds are unusable', () => {
    expect(loopWindow({ ...base, mode: 'none' })).toBeNull()
    expect(loopWindow({ ...base, cueEnd: 10 })).toBeNull()
    expect(loopWindow({ ...base, mode: 'ab', pointA: 9, pointB: 3 })).toBeNull()
    expect(loopWindow({ ...base, mode: 'ab', pointA: 3, pointB: null })).toBeNull()
  })
})

describe('planLoop', () => {
  it('does nothing while the position is inside the window', () => {
    expect(planLoop({ ...base, time: 12 })).toEqual({ seekTo: null, stop: false, playsDone: 0 })
  })

  it('wraps to the start once the position reaches the end', () => {
    expect(planLoop({ ...base, time: 14 })).toEqual({ seekTo: 10, stop: false, playsDone: 1 })
  })

  it('ignores a wrap that arrives while still inside the window', () => {
    expect(planLoop({ ...base, time: 13.5 }).seekTo).toBeNull()
    expect(planLoop({ ...base, time: 9.9 }).seekTo).toBeNull()
  })

  it('stops once the requested number of passes is complete', () => {
    expect(planLoop({ ...base, time: 14, repeats: 2, playsDone: 0 })).toEqual({
      seekTo: 10,
      stop: false,
      playsDone: 1,
    })
    expect(planLoop({ ...base, time: 14, repeats: 2, playsDone: 1 })).toEqual({
      seekTo: null,
      stop: true,
      playsDone: 2,
    })
  })

  it('never stops on its own when the count is endless', () => {
    expect(planLoop({ ...base, time: 14, repeats: 0, playsDone: 999 }).stop).toBe(false)
  })

  it('leaves the position alone when nothing is looping', () => {
    expect(planLoop({ ...base, mode: 'none', time: 99 })).toEqual({ seekTo: null, stop: false, playsDone: 0 })
  })
})

describe('stepCueIndex', () => {
  it('clamps at both ends instead of wrapping around', () => {
    expect(stepCueIndex(0, -1, 5)).toBe(0)
    expect(stepCueIndex(4, 1, 5)).toBe(4)
    expect(stepCueIndex(2, 1, 5)).toBe(3)
  })

  it('has nowhere to go in an empty list', () => {
    expect(stepCueIndex(-1, 1, 0)).toBe(-1)
  })
})
