/**
 * Picking a phrase on the stage by pressing one word and moving to another, with a mouse, a pen or a finger.
 *
 * This is the part of the gesture that does not need React or a DOM, so it can be tested without either:
 * the stage hands it a source of pointer events and a way to ask which word is under a point, and it
 * says which words are swept and where the drag ended.
 *
 * Why pointer events, and why a hit test on the point instead of an enter event on each word:
 *
 *   · iOS fires no mouse events during a touch drag (only the synthesized ones after a tap), so a
 *     `mousedown`, `mouseenter` and `mouseup` drag never sees a finger move.
 *   · A touch pointer is implicitly captured by the element it went down on, so no other word is ever
 *     entered, and every `pointermove` is dispatched to the first word. The word under the finger has
 *     to be found from its coordinates.
 */

/** The events a drag listens to. */
export type PointerEventType = 'pointermove' | 'pointerup' | 'pointercancel'

/** What the drag reads of a pointer event. */
export interface PointerLike {
  readonly pointerId: number
  readonly clientX: number
  readonly clientY: number
}

/** Where pointer events come from; the page's document in the stage, a fake in tests. */
export interface PointerSource {
  /** Listen to one kind of event, and get back the function that stops listening. */
  readonly listen: (type: PointerEventType, handler: (event: PointerLike) => void) => () => void
}

/** What a press on a word means. */
export type PressAction = 'ignore' | 'extend' | 'drag'

export interface PressInfo {
  /** The button of the press; a touch or a pen contact reports 0, like the primary mouse button. */
  readonly button: number
  /** Whether it is the primary pointer of its kind; the second finger of a pinch is not. */
  readonly isPrimary: boolean
  readonly shiftKey: boolean
  /** Whether a phrase is already picked and its popover is up. */
  readonly pinned: boolean
}

/**
 * A press on a word: a right click or a second finger is ignored, `Shift` with a phrase already picked
 * extends it to the word, and anything else starts a drag that picks the word itself if it ends there.
 */
export function pressAction({ button, isPrimary, shiftKey, pinned }: PressInfo): PressAction {
  if (button !== 0 || !isPrimary) return 'ignore'
  return shiftKey && pinned ? 'extend' : 'drag'
}

/** What `isOutsidePress` needs of a target; an element has it, and so does a test double. */
interface Closest {
  readonly closest: (selector: string) => unknown
}

/** The popover, and the words it is about; a press on either is not a press elsewhere. */
const INSIDE = '.dsh-lingualab-word-pop, .is-word'

/** Whether a press went down outside the popover and the words, which is what closes the popover. */
export function isOutsidePress(target: unknown): boolean {
  if (typeof target !== 'object' || target === null) return true
  const { closest } = target as Partial<Closest>
  if (typeof closest !== 'function') return true
  return closest.call(target, INSIDE) === null
}

export interface WordDragOptions {
  readonly source: PointerSource
  /** The pointer that went down on the word; the events of any other are not this drag's. */
  readonly pointerId: number
  /** The token the press went down on. */
  readonly anchor: number
  /** The token under a point, or `null` where there is none (a gap, a margin, another sentence). */
  readonly tokenAt: (x: number, y: number) => number | null
  /** The pointer moved onto another word. */
  readonly onSweep: (over: number) => void
  /** The pointer came up: where the drag began and the last word it was over. */
  readonly onRelease: (anchor: number, over: number) => void
  /** The system took the pointer away (a scroll, a call): nothing is picked. */
  readonly onCancel?: () => void
}

/**
 * Follow a pointer from a word it went down on until it comes up or is cancelled.
 *
 * The word under the pointer is looked up on every move and on the release, and a move over a gap keeps
 * the last word, so the phrase never loses its end to a space between two words. Returns `stop`, which
 * ends the drag without calling anything and may be called again.
 */
export function startWordDrag({ source, pointerId, anchor, tokenAt, onSweep, onRelease, onCancel }: WordDragOptions): () => void {
  let over = anchor
  let ended = false
  const offs: Array<() => void> = []

  const stop = (): void => {
    if (ended) return
    ended = true
    for (const off of offs) off()
    offs.length = 0
  }

  /** The word the event is over, kept as the last one when it is over none. */
  const reach = (event: PointerLike): number => {
    over = tokenAt(event.clientX, event.clientY) ?? over
    return over
  }

  offs.push(
    source.listen('pointermove', (event) => {
      if (ended || event.pointerId !== pointerId) return
      const before = over
      if (reach(event) !== before) onSweep(over)
    }),
    source.listen('pointerup', (event) => {
      if (ended || event.pointerId !== pointerId) return
      reach(event)
      stop()
      onRelease(anchor, over)
    }),
    source.listen('pointercancel', (event) => {
      if (ended || event.pointerId !== pointerId) return
      stop()
      onCancel?.()
    }),
  )
  return stop
}
