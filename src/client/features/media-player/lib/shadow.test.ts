import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SHADOW,
  parseShadowSettings,
  planShadow,
  shadowPauseMs,
  type ShadowInput,
  type ShadowPlan,
  type ShadowSettings,
} from './shadow.ts'

/** Run a sentence through the program from its first play, as the store would, and list what it did. */
function run(settings: ShadowSettings, last = false): ShadowPlan[] {
  const steps: ShadowPlan[] = []
  let input: ShadowInput = { played: 1, after: null, settings, last }
  for (let guard = 0; guard < 12; guard += 1) {
    const plan = planShadow(input)
    steps.push(plan)
    if (plan.do === 'stop' || plan.do === 'advance') return steps
    input = plan.do === 'replay' ? { ...input, played: input.played + 1, after: null } : { ...input, after: plan.phase }
  }
  throw new Error('the program never finished the sentence')
}

describe('planShadow', () => {
  it('stops after one play, uncovered, with the defaults, as shadowing always has', () => {
    expect(run(DEFAULT_SHADOW)).toEqual([{ do: 'stop' }])
  })

  it('plays a sentence as many times as asked, uncovering it from the second play on', () => {
    expect(run({ plays: 3, pause: 'off', advance: false })).toEqual([
      { do: 'replay', reveal: true },
      { do: 'replay', reveal: true },
      { do: 'stop' },
    ])
  })

  it('keeps the English covered through the first play and its pause, the one blind attempt', () => {
    expect(run({ plays: 2, pause: 'same', advance: false })).toEqual([
      { do: 'wait', phase: 'speak', reveal: false },
      { do: 'replay', reveal: true },
      { do: 'wait', phase: 'speak', reveal: true },
      { do: 'stop' },
    ])
  })

  it('uncovers a single play when its pause ends', () => {
    expect(run({ plays: 1, pause: 'long', advance: false })).toEqual([{ do: 'wait', phase: 'speak', reveal: false }, { do: 'stop' }])
  })

  it('shows an uncovered single play for one more pause before going on, so it is read', () => {
    expect(run({ plays: 1, pause: 'same', advance: true })).toEqual([
      { do: 'wait', phase: 'speak', reveal: false },
      { do: 'wait', phase: 'look', reveal: true },
      { do: 'advance' },
    ])
  })

  it('goes straight on after the last pause when the sentence was already uncovered by a second play', () => {
    expect(run({ plays: 2, pause: 'same', advance: true }).at(-1)).toEqual({ do: 'advance' })
    expect(run({ plays: 2, pause: 'same', advance: true })).toHaveLength(4)
  })

  it('runs covered sentence after sentence with no pause and auto-advance, which is simultaneous shadowing', () => {
    expect(run({ plays: 1, pause: 'off', advance: true })).toEqual([{ do: 'advance' }])
  })

  it('stops on the last sentence, which has no next one', () => {
    expect(run({ plays: 1, pause: 'same', advance: true }, true)).toEqual([{ do: 'wait', phase: 'speak', reveal: false }, { do: 'stop' }])
    expect(planShadow({ played: 1, after: 'look', settings: { plays: 1, pause: 'same', advance: true }, last: true })).toEqual({ do: 'stop' })
  })
})

describe('shadowPauseMs', () => {
  it('is nothing when the pause is off', () => {
    expect(shadowPauseMs(3, 1, 'off')).toBe(0)
  })

  it('is the sentence, or one and a half of it, plus a second to start speaking', () => {
    expect(shadowPauseMs(2, 1, 'same')).toBe(3000)
    expect(shadowPauseMs(2, 1, 'long')).toBe(4000)
  })

  it('grows with a slower speed, since the sentence was heard that slowly', () => {
    expect(shadowPauseMs(2, 0.5, 'same')).toBe(5000)
    expect(shadowPauseMs(2, 0, 'same')).toBe(3000)
  })
})

describe('parseShadowSettings', () => {
  it('keeps offered values and drops the rest', () => {
    expect(parseShadowSettings({ plays: 2, pause: 'long', advance: true })).toEqual({ plays: 2, pause: 'long', advance: true })
    expect(parseShadowSettings({ plays: 7, pause: 'forever', advance: 'yes' })).toEqual(DEFAULT_SHADOW)
    expect(parseShadowSettings(null)).toEqual(DEFAULT_SHADOW)
  })
})
