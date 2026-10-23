/**
 * The popovers of the control bar close the same way: a press outside the element that holds them.
 *
 * The holder is the button and the popover together, so a press on the button that opened the popover counts as
 * inside; the button's own handler decides whether that press closes it. Only an open popover listens, and the
 * listener is removed as soon as it closes, so a closed one cannot react to anything.
 */
import { useEffect, useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react'

/**
 * Attach the outside-press listener for a popover, if it is open.
 *
 * This is the body of {@link usePopover}'s effect, kept separate so it has a test: the repository renders
 * components to strings, so an effect is the one part of a hook a test cannot run through a component.
 *
 * @param open Whether the popover is open.
 * @param holder The element that holds both the button and the popover.
 * @param close What to do when a press lands outside the holder.
 * @param target Where the press is listened for; `window` in the page.
 * @returns The cleanup that removes the listener, or nothing when the popover is closed.
 */
export function watchOutside(
  open: boolean,
  holder: Pick<HTMLElement, 'contains'> | null,
  close: () => void,
  target: EventTarget = window,
): (() => void) | undefined {
  if (!open || holder === null) return undefined
  const onDown = (event: Event): void => {
    if (!holder.contains(event.target as Node)) close()
  }
  target.addEventListener('mousedown', onDown)
  return () => target.removeEventListener('mousedown', onDown)
}

/**
 * A ref for the element holding a popover's button and body, with a press outside it closing the popover.
 *
 * The callback is read through a ref: the page passes a new function on every render, and a new function should not
 * look like a new listener.
 */
export function usePopover(open: boolean, onClose: () => void): RefObject<HTMLSpanElement> {
  const holder = useRef<HTMLSpanElement>(null)
  const close = useRef(onClose)
  useEffect(() => {
    close.current = onClose
  }, [onClose])
  useEffect(() => watchOutside(open, holder.current, () => close.current()), [open])
  return holder
}

/** The two popovers that share one open state: the speed picker and the 「更多」 menu. */
export type Menu = 'speed' | 'more' | null

/** The menu a press leaves open: its own button closes it, any other opens it. */
export function toggledMenu(current: Menu, pressed: Exclude<Menu, null>): Menu {
  return current === pressed ? null : pressed
}

/** Escape heard from inside a popover closes it, and stops there so the page does not also spend the key. */
export function escapeToClose(close: () => boolean): (event: ReactKeyboardEvent<HTMLSpanElement>) => void {
  return (event) => {
    if (event.key !== 'Escape' || !close()) return
    event.preventDefault()
    event.stopPropagation()
  }
}

/** Put focus back on the button that opened a popover. */
export function focusButton(button: RefObject<HTMLButtonElement>): void {
  button.current?.focus({ preventScroll: true })
}
