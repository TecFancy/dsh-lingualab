/**
 * Where a new source starts: the rule behind keeping the position when the sources are swapped under one element.
 *
 * Pure, so the rule is a plain test; `useMediaBinding` asks it each time the source changes.
 */

/** `HTMLMediaElement.readyState` once the length and position mean something. */
const HAVE_METADATA = 1

/** The source the element was last given, and for whom, to tell a swap from a change of episode. */
export interface Loaded<E> {
  readonly element: E
  readonly src: string | null
  readonly session: string | null
  /** The position it was to start from, for when it never loads and the next swap has to carry it on. */
  readonly start: number
}

/** What the element says now, before the new source is loaded. */
export interface ElementNow {
  readonly readyState: number
  readonly currentTime: number
}

/**
 * The position a new source starts from.
 *
 * Only a swap under the same element and the same session keeps the position; anything else starts from the top. A
 * source that never got as far as its metadata (a file the browser cannot open) has been reset to 0 by its load, so the
 * position it was to start from is carried on instead.
 * @param before - what the element was given last, or `null`.
 * @param next - the source about to be loaded.
 * @param now - the element's state before the new source is loaded.
 * @returns the seconds to start from, 0 for the top.
 */
export function swapStart<E>(before: Loaded<E> | null, next: Omit<Loaded<E>, 'start'>, now: ElementNow): number {
  const swap =
    before !== null &&
    before.element === next.element &&
    before.session === next.session &&
    before.src !== null &&
    before.src !== next.src &&
    next.src !== null
  if (!swap) return 0
  return now.readyState >= HAVE_METADATA ? now.currentTime : before.start
}
