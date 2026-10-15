/**
 * Giving the one media element its source and its seeks, outside React so a fake element can stand in for it.
 *
 * `useMediaBinding` calls these from its effects. They share one record of what the element was last given
 * ({@link Loaded}), because the two depend on each other: a seek asked for while a same-session swap is still loading
 * (a step to the next sentence right after the picture is shown again) becomes where that swap starts. Applied to the
 * element instead, it would be undone when the metadata arrives and the kept position is restored, and the sentence
 * counter, already moved by the store, would disagree with the playhead.
 */
import { seekDuringSwap, swapStart, type Loaded } from './swap.ts'

/** The members of `HTMLMediaElement` used here. */
export interface SourceElement {
  src: string
  currentTime: number
  readonly readyState: number
  load(): void
  removeAttribute(name: 'src'): void
  addEventListener(type: 'loadedmetadata', listener: () => void, options: { once: boolean }): void
  removeEventListener(type: 'loadedmetadata', listener: () => void): void
}

/** Where the record of what the element was last given is kept (a React ref). */
export interface LoadedRef<E> {
  current: Loaded<E> | null
}

/**
 * Load a new source, keeping the position when it is a swap within the session.
 *
 * `load()` resets the position to 0; a kept position is restored once the new source's metadata arrives, from the
 * record rather than from a copy, so a seek taken in the meantime by {@link seekElement} is the one restored.
 * @param element - the media element.
 * @param loaded - the shared record, updated here.
 * @param src - the URL to play, or `null` for nothing.
 * @param session - what the source belongs to; a new `src` under the same one is a swap.
 * @returns the cleanup that drops a restore still waiting, or `undefined` when there is none.
 */
export function loadSource<E extends SourceElement>(
  element: E,
  loaded: LoadedRef<E>,
  src: string | null,
  session: string | null,
): (() => void) | undefined {
  const start = swapStart(loaded.current, { element, src, session }, element)
  loaded.current = { element, src, session, start, pending: start > 0 }
  if (src === null) {
    element.removeAttribute('src')
    element.load()
    return undefined
  }
  element.src = src
  element.load()
  if (start <= 0) return undefined
  const restore = (): void => {
    const now = loaded.current
    if (now?.element !== element || now.src !== src) return
    loaded.current = { ...now, pending: false }
    element.currentTime = now.start
  }
  element.addEventListener('loadedmetadata', restore, { once: true })
  return () => element.removeEventListener('loadedmetadata', restore)
}

/**
 * Move the element to a position the store asked for, or make it the start of the swap that is still loading.
 * @param element - the media element.
 * @param loaded - the shared record.
 * @param at - the seconds asked for.
 */
export function seekElement<E extends SourceElement>(element: E, loaded: LoadedRef<E>, at: number): void {
  const waiting = seekDuringSwap(loaded.current, at)
  if (waiting === null) element.currentTime = at
  else loaded.current = waiting
}

/**
 * Whether the element's position means something to the store. While a swap waits for its metadata it is the load's
 * reset to 0: written through, it would put the sentence counter on the first sentence, and a step taken then would
 * count from there.
 * @param loaded - the shared record.
 */
export function positionKnown<E>(loaded: LoadedRef<E>): boolean {
  return loaded.current?.pending !== true
}
