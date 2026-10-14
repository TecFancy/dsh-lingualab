import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SHADOW,
  mergeShadow,
  parseShadowSettings,
  planShadow,
  shadowPauseMs,
  type ShadowInput,
  type ShadowPlan,
  type ShadowSettings,
} from './shadow.ts'

/**
 * Run a sentence through the program from its first play, as the store would, and list what it did.
 *
 * @param recorded Whether every speaking pause was recorded, so each one is followed by a comparison.
 */
function run(settings: ShadowSettings, last = false, recorded = false): ShadowPlan[] {
  const steps: ShadowPlan[] = []
  let input: ShadowInput = { played: 1, after: null, settings, last }
  for (let guard = 0; guard < 12; guard += 1) {
    const plan = planShadow(input)
    steps.push(plan)
    if (plan.do === 'stop' || plan.do === 'advance') return steps
    if (plan.do === 'replay') input = { ...input, played: input.played + 1, after: null }
    // A comparison hands back to the same question the pause was asked, with nothing left to compare.
    else if (plan.do === 'compare') input = { ...input, after: 'speak', compare: false }
    else input = { ...input, after: plan.phase, compare: plan.phase === 'speak' && recorded }
  }
  throw new Error('the program never finished the sentence')
}

describe('planShadow', () => {
  it('stops after one play, uncovered, with the defaults, as shadowing always has', () => {
    expect(run(DEFAULT_SHADOW)).toEqual([{ do: 'stop' }])
  })

  it('plays a sentence as many times as asked, uncovering it from the second play on', () => {
    expect(run({ plays: 3, pause: 'off', advance: false, record: false })).toEqual([
      { do: 'replay', reveal: true },
      { do: 'replay', reveal: true },
      { do: 'stop' },
    ])
  })

  it('keeps the English covered through the first play and its pause, the one blind attempt', () => {
    expect(run({ plays: 2, pause: 'same', advance: false, record: false })).toEqual([
      { do: 'wait', phase: 'speak', reveal: false },
      { do: 'replay', reveal: true },
      { do: 'wait', phase: 'speak', reveal: true },
      { do: 'stop' },
    ])
  })

  it('uncovers a single play when its pause ends', () => {
    expect(run({ plays: 1, pause: 'long', advance: false, record: false })).toEqual([{ do: 'wait', phase: 'speak', reveal: false }, { do: 'stop' }])
  })

  it('shows an uncovered single play for one more pause before going on, so it is read', () => {
    expect(run({ plays: 1, pause: 'same', advance: true, record: false })).toEqual([
      { do: 'wait', phase: 'speak', reveal: false },
      { do: 'wait', phase: 'look', reveal: true },
      { do: 'advance' },
    ])
  })

  it('goes straight on after the last pause when the sentence was already uncovered by a second play', () => {
    expect(run({ plays: 2, pause: 'same', advance: true, record: false }).at(-1)).toEqual({ do: 'advance' })
    expect(run({ plays: 2, pause: 'same', advance: true, record: false })).toHaveLength(4)
  })

  it('runs covered sentence after sentence with no pause and auto-advance, which is simultaneous shadowing', () => {
    expect(run({ plays: 1, pause: 'off', advance: true, record: false })).toEqual([{ do: 'advance' }])
  })

  it('stops on the last sentence, which has no next one', () => {
    expect(run({ plays: 1, pause: 'same', advance: true, record: false }, true)).toEqual([{ do: 'wait', phase: 'speak', reveal: false }, { do: 'stop' }])
    expect(planShadow({ played: 1, after: 'look', settings: { plays: 1, pause: 'same', advance: true, record: false }, last: true })).toEqual({ do: 'stop' })
  })
})

describe('planShadow with a recorded pause', () => {
  const recording: ShadowSettings = { plays: 1, pause: 'same', advance: false, record: true }

  it('compares after the speaking pause, then does what it would have done without the take', () => {
    expect(run(recording, false, true)).toEqual([{ do: 'wait', phase: 'speak', reveal: false }, { do: 'compare' }, { do: 'stop' }])
    expect(run({ ...recording, plays: 2 }, false, true)).toEqual([
      { do: 'wait', phase: 'speak', reveal: false },
      { do: 'compare' },
      { do: 'replay', reveal: true },
      { do: 'wait', phase: 'speak', reveal: true },
      { do: 'compare' },
      { do: 'stop' },
    ])
  })

  it('reads the sentence for one more pause after the comparison when it is going on by itself', () => {
    expect(run({ ...recording, advance: true }, false, true)).toEqual([
      { do: 'wait', phase: 'speak', reveal: false },
      { do: 'compare' },
      { do: 'wait', phase: 'look', reveal: true },
      { do: 'advance' },
    ])
  })

  it('does not compare the look that follows, nor a pause with nothing recorded', () => {
    expect(planShadow({ played: 1, after: 'look', settings: recording, last: false, compare: true })).toEqual({ do: 'stop' })
    expect(run(recording, false, false)).toEqual([{ do: 'wait', phase: 'speak', reveal: false }, { do: 'stop' }])
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
    expect(parseShadowSettings({ plays: 2, pause: 'long', advance: true, record: false })).toEqual({ plays: 2, pause: 'long', advance: true, record: false })
    expect(parseShadowSettings({ plays: 7, pause: 'forever', advance: 'yes' })).toEqual(DEFAULT_SHADOW)
    expect(parseShadowSettings(null)).toEqual(DEFAULT_SHADOW)
  })
})

describe('recording and the pause', () => {
  it('reads settings stored before recording existed as not recording, and never records without a pause', () => {
    expect(parseShadowSettings({ plays: 2, pause: 'same', advance: false }).record).toBe(false)
    expect(parseShadowSettings({ plays: 1, pause: 'off', advance: false, record: true }).record).toBe(false)
    expect(parseShadowSettings({ plays: 1, pause: 'same', advance: false, record: true }).record).toBe(true)
  })

  it('turns the pause on to the sentence length when the microphone is switched on without one', () => {
    expect(mergeShadow(DEFAULT_SHADOW, { record: true })).toEqual({ plays: 1, pause: 'same', advance: false, record: true })
  })

  it('keeps a pause the reader already chose, and one chosen in the same change', () => {
    expect(mergeShadow({ ...DEFAULT_SHADOW, pause: 'long' }, { record: true }).pause).toBe('long')
    expect(mergeShadow(DEFAULT_SHADOW, { record: true, pause: 'long' }).pause).toBe('long')
  })

  it('turns the microphone off when the pause is turned off', () => {
    const recording = mergeShadow(DEFAULT_SHADOW, { record: true })
    expect(mergeShadow(recording, { pause: 'off' })).toEqual(DEFAULT_SHADOW)
    expect(mergeShadow(recording, { record: false }).pause).toBe('same')
  })
})
