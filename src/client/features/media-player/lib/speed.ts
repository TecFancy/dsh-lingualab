/**
 * The speed and the speed `=` comes back to.
 *
 * Choosing a speed other than 1x remembers it, so `=` can return to it. The rule lives here as two pure
 * functions: the store only has to call them, and a test can walk a sequence of choices without a browser.
 */

/** Ten steps, all of them pitch-preserving. Ported from the repealed repeater app. */
export const SPEED_PRESETS: readonly number[] = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.15, 1.25, 1.5, 2]

/** Where the default speed sits in {@link SPEED_PRESETS}. */
export const DEFAULT_SPEED_INDEX = 5

/** The speed in force and the speed `=` goes back to. */
export interface SpeedState {
  readonly speedIndex: number
  readonly lastSpeedIndex: number | null
}

/**
 * The state after choosing `index`: any speed other than 1x becomes the one `=` goes back to, and choosing
 * 1x keeps the speed already remembered.
 *
 * The caller clamps the index first, so this only has to know where 1x sits.
 */
export function chooseSpeed(index: number, lastSpeedIndex: number | null): SpeedState {
  return {
    speedIndex: index,
    lastSpeedIndex: index === DEFAULT_SPEED_INDEX ? lastSpeedIndex : index,
  }
}

/**
 * Where `=` goes from the speed in force: 1x when it is another speed, otherwise the last speed other than
 * 1x, or `null` when there is none to go back to.
 */
export function speedResetIndex({ speedIndex, lastSpeedIndex }: SpeedState): number | null {
  return speedIndex === DEFAULT_SPEED_INDEX ? lastSpeedIndex : DEFAULT_SPEED_INDEX
}
