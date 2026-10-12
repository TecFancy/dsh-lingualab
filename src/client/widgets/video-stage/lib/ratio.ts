/**
 * The shape of the picture, for the large state's frame.
 *
 * Until the element has told its size (`loadedmetadata`) the picture is taken to be 16:9, the shape nearly all
 * video has; an audio file has no picture and reports 0 by 0, which is the same answer.
 */

/** The shape assumed before the real one is known. */
export const DEFAULT_RATIO = 16 / 9

/** Width over height from what the media element reports, or `null` when it reports no picture. */
export function ratioOf(width: number, height: number): number | null {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null
  return width / height
}

/**
 * The value of the `--ll-video-ratio` custom property: a plain number, four decimals, which is what `aspect-ratio`
 * and the frame's width calculation both read.
 */
export function ratioValue(ratio: number | null): string {
  return String(Number((ratio ?? DEFAULT_RATIO).toFixed(4)))
}
