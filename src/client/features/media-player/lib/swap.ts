/**
 * Where a new source starts: the rule behind keeping the position when the sources are swapped under one element.
 *
 * Pure, so the rule is a plain test; `load-source.ts` asks it each time the source changes, and again for each seek
 * asked for while a swap is still loading.
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
  /**
   * The start is still to be applied: a swap that keeps a position and has not had its metadata yet. Until then the
   * element's own position is the load's reset to 0, not where the reader is.
   */
  readonly pending: boolean
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
 * position it was to start from is carried on instead; so is the start of one whose metadata came but was not applied yet.
 * @param before - what the element was given last, or `null`.
 * @param next - the source about to be loaded.
 * @param now - the element's state before the new source is loaded.
 * @returns the seconds to start from, 0 for the top.
 */
export function swapStart<E>(
  before: Loaded<E> | null,
  next: Omit<Loaded<E>, 'start' | 'pending'>,
  now: ElementNow,
): number {
  const swap =
    before !== null &&
    before.element === next.element &&
    before.session === next.session &&
    before.src !== null &&
    before.src !== next.src &&
    next.src !== null
  if (!swap) return 0
  return before.pending || now.readyState < HAVE_METADATA ? before.start : now.currentTime
}

/**
 * A seek asked for while the element loads.
 *
 * A swap still waiting for its metadata takes the seek as its start: applying it to the element would be undone once
 * the metadata arrives and the kept position is restored, and the store has already moved to the new sentence. Without
 * a swap waiting there is nothing to take it, and it goes to the element as it always did (a seek during the load of
 * another episode's source included).
 * @param loaded - what the element was given last, or `null`.
 * @param at - the seconds asked for.
 * @returns the swap with its new start, or `null` when the seek goes straight to the element.
 */
export function seekDuringSwap<E>(loaded: Loaded<E> | null, at: number): Loaded<E> | null {
  return loaded !== null && loaded.pending ? { ...loaded, start: at } : null
}
