/**
 * Fine scrubbing on the progress bar, as pure functions.
 *
 * On a long recording the bar puts several seconds under each pixel. While the thumb is held, moving the finger away
 * from the bar, up or down, lowers the scrub speed in steps, as the iOS music player does: full, half, a quarter, one
 * step per {@link SCRUB_STEP_PX} of distance. Distance counts either way because in landscape the bar sits close to the
 * bottom of the screen, and three steps of that size are what fit below it.
 *
 * Horizontal movement is applied at the current speed relative to where the step was entered, so changing step never
 * moves the thumb. At full speed, before any change of step, the thumb is exactly under the finger, as before.
 */

/** How far from the bar, in CSS pixels, each slower step begins. */
export const SCRUB_STEP_PX = 44

/** The speeds, fastest first; the index is the step. */
export const SCRUB_SPEEDS = [1, 0.5, 0.25] as const

/** The locale key that names each step's speed. */
export const SCRUB_SPEED_KEYS = ['scrubFull', 'scrubHalf', 'scrubQuarter'] as const

/** A drag in progress, all along the bar as 0..1 except the pointer's x, in the bar's pixels. */
export interface ScrubDrag {
  /** Where the thumb is. */
  readonly fraction: number
  /** Which speed applies, an index into {@link SCRUB_SPEEDS}. */
  readonly step: number
  /** The pointer's x and the thumb's place when this step was entered. */
  readonly anchorX: number
  readonly anchorFraction: number
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))

/** How far a point is from the bar's band vertically: zero on it, positive above or below it. */
export function distanceFromBar(y: number, top: number, bottom: number): number {
  if (y < top) return top - y
  if (y > bottom) return y - bottom
  return 0
}

/** The step for a distance from the bar. */
export function scrubStep(distance: number): number {
  if (!(distance > 0)) return 0
  return Math.min(SCRUB_SPEEDS.length - 1, Math.floor(distance / SCRUB_STEP_PX))
}

/** A press on the bar: the thumb goes to the point, at full speed. */
export function startScrub(x: number, width: number): ScrubDrag {
  const fraction = width > 0 ? clamp01(x / width) : 0
  return { fraction, step: 0, anchorX: x, anchorFraction: fraction }
}

/**
 * A move while the thumb is held. `x` is the pointer's x relative to the bar's left edge, not clamped to the bar, so a
 * slow step can still travel once the finger is past an end.
 */
export function moveScrub(drag: ScrubDrag, x: number, distance: number, width: number): ScrubDrag {
  if (!(width > 0)) return drag
  const speed = SCRUB_SPEEDS[drag.step] ?? 1
  const fraction = clamp01(drag.anchorFraction + ((x - drag.anchorX) / width) * speed)
  const step = scrubStep(distance)
  if (step === drag.step) return { ...drag, fraction }
  // The move that crossed the boundary is applied at the old speed, then the new step is anchored where the thumb is.
  return { fraction, step, anchorX: x, anchorFraction: fraction }
}

/** Where to put a label centred over a point of the bar, and how wide it may be, so it stays inside the card. */
export interface LabelPlacement {
  /** The label's centre, in the bar's pixels. */
  readonly left: number
  readonly maxWidth: number
}

/** The geometry {@link placeLabel} needs, in viewport pixels except `x`. */
export interface LabelBounds {
  /** The point's x in the bar's pixels. */
  readonly x: number
  readonly barLeft: number
  readonly cardLeft: number
  readonly cardWidth: number
}

/** The widest a label gets, and the gap it keeps from the card's edges. */
export const LABEL_MAX_PX = 240
export const LABEL_INSET_PX = 8

/** Centre the label over the point, slid inward where the card's edge would cut it. */
export function placeLabel({ x, barLeft, cardLeft, cardWidth }: LabelBounds): LabelPlacement {
  const maxWidth = Math.max(0, Math.min(LABEL_MAX_PX, cardWidth - 2 * LABEL_INSET_PX))
  const half = maxWidth / 2
  const min = cardLeft - barLeft + LABEL_INSET_PX + half
  const max = cardLeft - barLeft + cardWidth - LABEL_INSET_PX - half
  return { left: max < min ? (min + max) / 2 : Math.min(max, Math.max(min, x)), maxWidth }
}
