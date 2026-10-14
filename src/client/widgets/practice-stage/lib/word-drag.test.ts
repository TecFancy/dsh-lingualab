// @vitest-environment node
/**
 * Picking a phrase by dragging, with the pointer events and the hit test replaced by fakes (there is no DOM in these
 * tests). The words sit in a row, 100 px wide each, at y 0 to 20: word 0 is x 0 to 99, word 1 is x 100 to 199, and so on.
 * Anything outside that row is no word.
 */
import { describe, expect, it, vi } from 'vitest'
import {
  isOutsidePress,
  pressAction,
  startWordDrag,
  type PointerEventType,
  type PointerLike,
  type PointerSource,
} from './word-drag.ts'

/** A pointer source that can be driven by hand, and counts what is still listening. */
function fakeSource() {
  const handlers = new Map<PointerEventType, Set<(event: PointerLike) => void>>()
  const source: PointerSource = {
    listen(type, handler) {
      const set = handlers.get(type) ?? new Set()
      set.add(handler)
      handlers.set(type, set)
      return () => set.delete(handler)
    },
  }
  return {
    source,
    fire(type: PointerEventType, x: number, y = 10, pointerId = 1): void {
      for (const handler of [...(handlers.get(type) ?? [])]) handler({ pointerId, clientX: x, clientY: y })
    },
    listening: (): number => [...handlers.values()].reduce((sum, set) => sum + set.size, 0),
  }
}

/** The word at a point of the row, or none. */
const tokenAt = (x: number, y: number): number | null => (y < 0 || y > 20 || x < 0 || x >= 500 ? null : Math.floor(x / 100))

/** Start a drag on a word and record what it reports. */
function drag(anchor: number, pointerId = 1) {
  const pointers = fakeSource()
  const swept: number[] = []
  const released: Array<[number, number]> = []
  const cancel = vi.fn()
  const stop = startWordDrag({
    source: pointers.source,
    pointerId,
    anchor,
    tokenAt,
    onSweep: (over) => swept.push(over),
    onRelease: (from, over) => released.push([from, over]),
    onCancel: cancel,
  })
  return { ...pointers, swept, released, cancel, stop }
}

describe('startWordDrag', () => {
  it('picks the one word of a tap', () => {
    const run = drag(2)
    run.fire('pointerup', 250)
    expect(run.released).toEqual([[2, 2]])
    expect(run.swept).toEqual([])
  })

  it('picks the words from where a touch drag began to where it ended, once', () => {
    const run = drag(0)
    run.fire('pointermove', 60)
    run.fire('pointermove', 130)
    run.fire('pointermove', 170)
    run.fire('pointermove', 240)
    run.fire('pointerup', 245)
    expect(run.swept).toEqual([1, 2])
    expect(run.released).toEqual([[0, 2]])
    expect(run.cancel).not.toHaveBeenCalled()
  })

  it('finds the word under the finger by its coordinates, not by the element the events are sent to', () => {
    // A touch pointer is captured by the word it went down on, so all of its events share one target; only the point differs.
    const run = drag(1)
    run.fire('pointermove', 410)
    run.fire('pointerup', 410)
    expect(run.released).toEqual([[1, 4]])
  })

  it('picks backwards too, and keeps the order of the two ends as it is told', () => {
    const run = drag(3)
    run.fire('pointermove', 120)
    run.fire('pointerup', 120)
    expect(run.released).toEqual([[3, 1]])
  })

  it('keeps the last word when the pointer is over a gap or off the sentence, even where it comes up', () => {
    const run = drag(0)
    run.fire('pointermove', 150)
    run.fire('pointermove', 700)
    run.fire('pointermove', 150, 90)
    run.fire('pointerup', 700)
    expect(run.swept).toEqual([1])
    expect(run.released).toEqual([[0, 1]])
  })

  it('takes the word under the point it comes up at, even without a move before it', () => {
    const run = drag(0)
    run.fire('pointerup', 330)
    expect(run.released).toEqual([[0, 3]])
  })

  it('picks nothing when the pointer is cancelled, and stops listening', () => {
    const run = drag(0)
    run.fire('pointermove', 150)
    run.fire('pointercancel', 150)
    run.fire('pointerup', 150)
    expect(run.released).toEqual([])
    expect(run.cancel).toHaveBeenCalledTimes(1)
    expect(run.listening()).toBe(0)
  })

  it('works the same for a mouse, whose drag is the same events', () => {
    const run = drag(1, 7)
    run.fire('pointermove', 210, 10, 7)
    run.fire('pointermove', 320, 10, 7)
    run.fire('pointerup', 320, 10, 7)
    expect(run.released).toEqual([[1, 3]])
  })

  it('ignores the events of any other pointer', () => {
    const run = drag(0, 1)
    run.fire('pointermove', 350, 10, 2)
    run.fire('pointerup', 350, 10, 2)
    run.fire('pointercancel', 350, 10, 2)
    expect(run.swept).toEqual([])
    expect(run.released).toEqual([])
    expect(run.cancel).not.toHaveBeenCalled()
    expect(run.listening()).toBe(3)
    run.fire('pointerup', 50)
    expect(run.released).toEqual([[0, 0]])
  })

  it('reports nothing after it is stopped, and can be stopped again', () => {
    const run = drag(0)
    run.stop()
    run.stop()
    run.fire('pointermove', 250)
    run.fire('pointerup', 250)
    expect(run.swept).toEqual([])
    expect(run.released).toEqual([])
    expect(run.cancel).not.toHaveBeenCalled()
    expect(run.listening()).toBe(0)
  })

  it('stops listening once it is released, so a second release is not reported', () => {
    const run = drag(0)
    run.fire('pointerup', 50)
    run.fire('pointerup', 250)
    expect(run.released).toEqual([[0, 0]])
    expect(run.listening()).toBe(0)
  })
})

describe('pressAction', () => {
  const press = { button: 0, isPrimary: true, shiftKey: false, pinned: false }

  it('starts a drag on a plain press, whether the pointer is a mouse, a pen or a finger', () => {
    expect(pressAction(press)).toBe('drag')
    expect(pressAction({ ...press, pinned: true })).toBe('drag')
  })

  it('extends the picked phrase on a Shift press, and only when there is one', () => {
    expect(pressAction({ ...press, shiftKey: true, pinned: true })).toBe('extend')
    expect(pressAction({ ...press, shiftKey: true })).toBe('drag')
  })

  it('ignores a right or middle click', () => {
    expect(pressAction({ ...press, button: 2 })).toBe('ignore')
    expect(pressAction({ ...press, button: 1 })).toBe('ignore')
    expect(pressAction({ ...press, button: 2, shiftKey: true, pinned: true })).toBe('ignore')
  })

  it('ignores a pointer that is not the primary one, such as the second finger of a pinch', () => {
    expect(pressAction({ ...press, isPrimary: false })).toBe('ignore')
    expect(pressAction({ ...press, isPrimary: false, shiftKey: true, pinned: true })).toBe('ignore')
  })
})

describe('isOutsidePress', () => {
  /** A target that is inside the thing the selector names only when `inside` says so. */
  const target = (inside: boolean) => ({
    closest: (selector: string): unknown => {
      expect(selector).toBe('.dsh-lingualab-word-pop, .is-word')
      return inside ? {} : null
    },
  })

  it('closes on a press outside the popover and the words', () => {
    expect(isOutsidePress(target(false))).toBe(true)
  })

  it('does not close on a press on the popover or on a word', () => {
    expect(isOutsidePress(target(true))).toBe(false)
  })

  it('closes on a press whose target is not an element', () => {
    expect(isOutsidePress(null)).toBe(true)
    expect(isOutsidePress(undefined)).toBe(true)
    expect(isOutsidePress({})).toBe(true)
  })
})
