/**
 * How many episode names the review bar's source list can show before it needs 「等 N 集」.
 *
 * The bar names the episodes the sentences come from, and the design gives that list at most
 * two rows. Which items fall on the second row depends on how long each title is, so the count
 * is not a number the page can be written with: the component measures the rendered items and
 * this function turns those widths into "show these many, summarise the rest".
 *
 * Pure data work over numbers, so it is tested without a browser.
 */

/** The column gap of the source list, in pixels; the stylesheet uses the same number. */
export const SOURCE_GAP = 18

/** How many items fit, and how many are left over. */
export interface SourceFit {
  /** Items that fit in the allowed rows, at most one per row beyond the first. */
  readonly shown: number
  /** Items that did not fit. */
  readonly rest: number
}

/**
 * Which of a row of measured items fit in a wrapping flex row.
 * @param widths - each item's width, in the order they are drawn.
 * @param container - the width the list has to wrap inside.
 * @param gap - the column gap between two items on one row.
 * @param rows - how many rows the list may take.
 * @returns how many items fit, and how many are left over.
 */
export function fitSources(
  widths: readonly number[],
  container: number,
  gap: number,
  rows = 2,
): SourceFit {
  let row = 1
  let used = 0
  let shown = 0
  for (const width of widths) {
    if (shown === 0) {
      used = width
    } else if (used + gap + width <= container) {
      used += gap + width
    } else {
      row += 1
      if (row > rows) break
      used = width
    }
    shown += 1
  }
  return { shown, rest: widths.length - shown }
}
