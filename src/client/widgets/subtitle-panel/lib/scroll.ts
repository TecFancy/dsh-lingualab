/**
 * How the subtitle list scrolls a row into view: by scrolling the list itself, into its middle band.
 *
 * `scrollIntoView` also scrolls every ancestor, which on a page that shares a document with a conversation moves the
 * wrong thing. Scrolling the one container we own does not. The elements are read through the few members used, so
 * the rule runs in a test without a browser.
 */

/** The members of the list that the scrolling reads and calls. */
export interface ScrollList {
  readonly scrollTop: number
  readonly clientHeight: number
  scrollTo(options: { top: number; behavior: 'smooth' | 'auto' }): void
}

/** The members of a row that the scrolling reads. */
export interface ScrollRow {
  readonly offsetTop: number
  readonly offsetHeight: number
}

/** Whether the user asked the system for less motion. */
function reducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Bring one row into the list's middle band. Nothing moves while it is already there, so following playback never
 * fights a user who scrolled a little. `smooth` is for following playback; a jump (a keyboard move, the list appearing
 * when the column is expanded) lands at once.
 */
export function bringIntoView(list: ScrollList, row: ScrollRow, smooth: boolean): void {
  const top = row.offsetTop
  const bottom = top + row.offsetHeight
  const margin = list.clientHeight * 0.28
  if (top >= list.scrollTop + margin && bottom <= list.scrollTop + list.clientHeight - margin) return
  list.scrollTo({
    top: Math.max(0, top - list.clientHeight / 2 + row.offsetHeight / 2),
    behavior: smooth && !reducedMotion() ? 'smooth' : 'auto',
  })
}
