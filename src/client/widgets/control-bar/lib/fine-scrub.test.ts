import { describe, expect, it } from 'vitest'
import type { Cue } from '../../../entities/cue/index.ts'
import {
  LABEL_INSET_PX,
  LABEL_MAX_PX,
  SCRUB_STEP_PX,
  distanceFromBar,
  moveScrub,
  placeLabel,
  scrubStep,
  startScrub,
} from './fine-scrub.ts'
import { scrubPoint } from './scrub-point.ts'

const WIDTH = 500

describe('the distance from the bar', () => {
  it('is zero on the bar and grows either way from it', () => {
    expect(distanceFromBar(110, 100, 122)).toBe(0)
    expect(distanceFromBar(60, 100, 122)).toBe(40)
    expect(distanceFromBar(172, 100, 122)).toBe(50)
  })
})

describe('the scrub step', () => {
  it('goes full, half, then a quarter, one step per 44px, and no slower', () => {
    expect(scrubStep(0)).toBe(0)
    expect(scrubStep(SCRUB_STEP_PX - 1)).toBe(0)
    expect(scrubStep(SCRUB_STEP_PX)).toBe(1)
    expect(scrubStep(2 * SCRUB_STEP_PX)).toBe(2)
    expect(scrubStep(10 * SCRUB_STEP_PX)).toBe(2)
  })
})

describe('a drag', () => {
  it('starts with the thumb under the finger', () => {
    expect(startScrub(125, WIDTH)).toEqual({ fraction: 0.25, step: 0, anchorX: 125, anchorFraction: 0.25 })
  })

  it('follows the finger exactly at full speed, as the bar always did', () => {
    const drag = moveScrub(startScrub(125, WIDTH), 300, 10, WIDTH)
    expect(drag.fraction).toBeCloseTo(0.6)
    expect(drag.step).toBe(0)
  })

  it('never moves the thumb when the finger only changes step', () => {
    const start = startScrub(250, WIDTH)
    const slow = moveScrub(start, 250, SCRUB_STEP_PX, WIDTH)
    expect(slow.fraction).toBe(0.5)
    expect(slow.step).toBe(1)
    const slower = moveScrub(slow, 250, 2 * SCRUB_STEP_PX, WIDTH)
    expect(slower.fraction).toBe(0.5)
    expect(slower.step).toBe(2)
  })

  it('moves half as far at half speed and a quarter as far at a quarter, from where the step began', () => {
    const half = moveScrub(startScrub(250, WIDTH), 250, SCRUB_STEP_PX, WIDTH)
    expect(moveScrub(half, 290, SCRUB_STEP_PX, WIDTH).fraction).toBeCloseTo(0.5 + 20 / WIDTH)
    const quarter = moveScrub(half, 250, 2 * SCRUB_STEP_PX, WIDTH)
    expect(moveScrub(quarter, 330, 2 * SCRUB_STEP_PX, WIDTH).fraction).toBeCloseTo(0.5 + 20 / WIDTH)
  })

  it('applies the move that crosses into a new step at the old speed', () => {
    const drag = moveScrub(startScrub(250, WIDTH), 300, SCRUB_STEP_PX, WIDTH)
    expect(drag.fraction).toBeCloseTo(0.6)
    expect(drag).toMatchObject({ step: 1, anchorX: 300 })
  })

  it('keeps going at a slow step once the finger is past the end of the bar, and stops at the end', () => {
    const slow = moveScrub(startScrub(480, WIDTH), 480, 2 * SCRUB_STEP_PX, WIDTH)
    expect(moveScrub(slow, 540, 2 * SCRUB_STEP_PX, WIDTH).fraction).toBeCloseTo(0.96 + 15 / WIDTH)
    expect(moveScrub(slow, 2000, 2 * SCRUB_STEP_PX, WIDTH).fraction).toBe(1)
  })

  it('does not move on a bar with no width', () => {
    const drag = startScrub(0, 0)
    expect(moveScrub(drag, 50, 0, 0)).toBe(drag)
  })
})

describe('the label', () => {
  // The bar starts 72px into a 720px card: 20px of padding, a 40px clock and a 12px gap.
  const bounds = { barLeft: 172, cardLeft: 100, cardWidth: 720 }
  const half = LABEL_MAX_PX / 2

  it('sits centred over the point in the middle of the card', () => {
    expect(placeLabel({ x: 300, ...bounds })).toEqual({ left: 300, maxWidth: LABEL_MAX_PX })
  })

  it('slides inward at either end so it stays inside the card, over the clocks if need be', () => {
    expect(placeLabel({ x: 0, ...bounds }).left).toBe(-72 + LABEL_INSET_PX + half)
    expect(placeLabel({ x: 576, ...bounds }).left).toBe(-72 + 720 - LABEL_INSET_PX - half)
  })

  it('narrows to the card when the card is narrower than the label', () => {
    const narrow = placeLabel({ x: 10, barLeft: 172, cardLeft: 100, cardWidth: 200 })
    expect(narrow.maxWidth).toBe(200 - 2 * LABEL_INSET_PX)
    expect(narrow.left).toBe(-72 + 100)
  })
})

describe('the place under the label', () => {
  const cues: Cue[] = [
    { start: 10, end: 12, text: 'One\n一' },
    { start: 20, end: 22, text: 'Two\n二' },
  ]

  it('reads the time, the sentence number and its English line', () => {
    expect(scrubPoint(cues, 100, 0.21)).toEqual({ time: 21, index: 1, english: 'Two' })
  })

  it('has no sentence before the first one', () => {
    expect(scrubPoint(cues, 100, 0.05)).toEqual({ time: 5, index: -1, english: '' })
  })
})
