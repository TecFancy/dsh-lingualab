import { describe, expect, it } from 'vitest'
import { DEFAULT_SPEED_INDEX, SPEED_PRESETS, chooseSpeed, speedResetIndex } from './speed.ts'

/** 0.7x, the speed in the note's example. */
const SLOW = 2
/** 0.8x. */
const FASTER = 3

describe('chooseSpeed', () => {
  it('remembers any speed other than 1x', () => {
    expect(chooseSpeed(0, null)).toEqual({ speedIndex: 0, lastSpeedIndex: 0 })
    expect(chooseSpeed(FASTER, SLOW)).toEqual({ speedIndex: FASTER, lastSpeedIndex: FASTER })
  })

  it('keeps the remembered speed when 1x is chosen', () => {
    expect(chooseSpeed(DEFAULT_SPEED_INDEX, SLOW)).toEqual({ speedIndex: DEFAULT_SPEED_INDEX, lastSpeedIndex: SLOW })
    expect(chooseSpeed(DEFAULT_SPEED_INDEX, null)).toEqual({ speedIndex: DEFAULT_SPEED_INDEX, lastSpeedIndex: null })
  })

  it('keeps the remembered speed through a step into 1x', () => {
    // The brackets walk up to 1x, which is not remembered; the step before it is.
    let state = chooseSpeed(FASTER, null)
    state = chooseSpeed(4, state.lastSpeedIndex)
    expect(state.lastSpeedIndex).toBe(4)
    state = chooseSpeed(DEFAULT_SPEED_INDEX, state.lastSpeedIndex)
    expect(state).toEqual({ speedIndex: DEFAULT_SPEED_INDEX, lastSpeedIndex: 4 })
  })
})

describe('speedResetIndex', () => {
  it('goes to 1x from another speed', () => {
    expect(speedResetIndex({ speedIndex: SLOW, lastSpeedIndex: SLOW })).toBe(DEFAULT_SPEED_INDEX)
  })

  it('goes back to the remembered speed from 1x', () => {
    expect(speedResetIndex({ speedIndex: DEFAULT_SPEED_INDEX, lastSpeedIndex: SLOW })).toBe(SLOW)
  })

  it('has nowhere to go at 1x with no remembered speed', () => {
    expect(speedResetIndex({ speedIndex: DEFAULT_SPEED_INDEX, lastSpeedIndex: null })).toBeNull()
  })

  it('walks the picker example: 0.7, 1x, 0.7, 1x', () => {
    const slow = chooseSpeed(SLOW, null)
    expect(slow).toEqual({ speedIndex: SLOW, lastSpeedIndex: SLOW })
    expect(speedResetIndex(slow)).toBe(DEFAULT_SPEED_INDEX)

    const normal = chooseSpeed(DEFAULT_SPEED_INDEX, slow.lastSpeedIndex)
    expect(normal).toEqual({ speedIndex: DEFAULT_SPEED_INDEX, lastSpeedIndex: SLOW })
    expect(speedResetIndex(normal)).toBe(SLOW)
  })

  it('walks the bracket example: 0.8, 1x, 0.8', () => {
    const faster = chooseSpeed(FASTER, SLOW)
    expect(faster).toEqual({ speedIndex: FASTER, lastSpeedIndex: FASTER })
    expect(speedResetIndex(faster)).toBe(DEFAULT_SPEED_INDEX)

    const normal = chooseSpeed(DEFAULT_SPEED_INDEX, faster.lastSpeedIndex)
    expect(speedResetIndex(normal)).toBe(FASTER)
  })

  it('puts the default index on 1x', () => {
    expect(SPEED_PRESETS[DEFAULT_SPEED_INDEX]).toBe(1)
  })
})
