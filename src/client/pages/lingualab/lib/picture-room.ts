/**
 * Whether the picture has room above the sentence, with the timing panel open or not: the arithmetic, apart from the DOM it
 * is read from.
 *
 * The picture takes whatever is left of the practice column's scroller once the other parts have their own height (up to
 * the size it would have anyway), so the room it would get is a sum of things that do not change when the picture is
 * not drawn. That is the point of computing it instead of reading the picture's own box: a box that disappears when it
 * is small would be small no longer, appear again, and flicker. The band between `PICTURE_MIN` and `PICTURE_BACK` is
 * the other half of that: once the picture has stepped aside it needs a little more than it gave up at, so a window
 * dragged along the edge does not toggle it on every pixel.
 */

/** The picture is not drawn under this much height (CSS pixels), the number the layout has always used. */
export const PICTURE_MIN = 120
/** A picture that has stepped aside comes back at this much, a band of 8px above where it left. */
export const PICTURE_BACK = 128

/**
 * The height of a flex column with a gap between its visible children, without being stretched by what it sits in.
 *
 * @param children The outer height of each visible child.
 * @param gap The gap between two neighbours.
 * @param padding The column's own vertical padding, top and bottom together.
 */
export function stackHeight(children: readonly number[], gap: number, padding: number): number {
  const between = children.length > 1 ? gap * (children.length - 1) : 0
  return children.reduce((sum, height) => sum + height, 0) + between + padding
}

/** What the measurement reads, in CSS pixels. */
export interface RoomInput {
  /** The scroller's height inside its own padding. */
  readonly viewport: number
  /** The height every other child of the scroller needs (the sentence stage, the timing strip), margins included. */
  readonly others: readonly number[]
  /** The picture stage's own vertical padding, which is not room for the picture. */
  readonly padding: number
}

/** The height the picture would get: what is left of the viewport. Zero when the others already fill it. */
export function pictureRoom({ viewport, others, padding }: RoomInput): number {
  return Math.max(0, others.reduce((left, height) => left - height, viewport) - padding)
}

/**
 * Whether the picture is drawn for this much room.
 *
 * @param room The room from `pictureRoom`.
 * @param drawn Whether the picture is drawn now; it decides which side of the band the room is judged from.
 */
export function pictureFits(room: number, drawn: boolean): boolean {
  return room >= (drawn ? PICTURE_MIN : PICTURE_BACK)
}
