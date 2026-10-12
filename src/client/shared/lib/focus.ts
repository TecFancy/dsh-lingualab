/**
 * Who has the keyboard after a click, and what a key means on a button.
 *
 * The page's shortcuts are read on the page's container, so a keystroke only counts while the focus is in
 * the container. A mouse click on a button used to leave the focus on the button, and from there two things
 * went wrong: a button that goes away when it is pressed (the peek and reveal buttons) dropped the focus to
 * the document, which is outside the container, so the space bar did nothing until the next click on the page;
 * and a button that stays kept the focus, so the space bar had to be taken from the button by the page, which
 * also took it from a keyboard reader who had tabbed to that button.
 *
 * The rule now: a mouse press on a button never moves the focus onto it (the container keeps it, so every
 * shortcut works after a click), and a button that has the focus by Tab keeps its own Space and Enter.
 * The helpers look at a few properties only, so they take any element-shaped object.
 */

/** The page's own element, the one that reads the shortcuts. */
export const PAGE_SELECTOR = '.dsh-lingualab-page'

/**
 * Regions that read the keyboard themselves, where focus on a button is the point: the modal layers and the
 * settings drawer (its arrows move between its own controls).
 */
export const OWN_KEYBOARD_SELECTOR = '.dsh-lingualab-mask, .dsh-lingualab-popover.is-settings'

/** The few things of an element these helpers read. */
export interface FocusTarget {
  readonly tagName?: string
  readonly type?: string
  closest?(selector: string): unknown
  getAttribute?(name: string): string | null
  focus?(options?: { preventScroll?: boolean }): void
}

/** Input types that are pressed, not typed into. */
const PRESSED_INPUTS = ['checkbox', 'radio', 'button', 'submit', 'reset']

function asTarget(target: unknown): FocusTarget | null {
  return typeof target === 'object' && target !== null ? (target as FocusTarget) : null
}

/**
 * Whether Space and Enter pressed with this element focused are the element's own: it is a button, a link,
 * a disclosure summary, a role-button, or a checkbox-like input, and the browser clicks it on those keys.
 */
export function activatesWithKeys(target: unknown): boolean {
  const element = asTarget(target)
  if (element === null || typeof element.tagName !== 'string') return false
  const tag = element.tagName.toLowerCase()
  if (tag === 'button' || tag === 'summary') return true
  if (tag === 'a') return element.getAttribute?.('href') != null
  if (tag === 'input') return PRESSED_INPUTS.includes(String(element.type))
  return element.getAttribute?.('role') === 'button'
}

/**
 * Whether the page must leave this keystroke alone: Space or Enter on a focused button is a press of that
 * button, so it is not "play or pause" and not "play the selected sentence". With the mouse never leaving
 * the focus on a button (below), this only ever affects a reader who got there with Tab.
 */
export function keepsKeyForTarget(target: unknown, key: string): boolean {
  return (key === ' ' || key === 'Enter') && activatesWithKeys(target)
}

/**
 * Whether a mouse press at this target should leave the focus where the container put it: the press is on (or
 * inside) a button, and not in a region that keeps its own focus.
 */
export function holdsMouseFocus(target: unknown): boolean {
  const element = asTarget(target)
  if (element === null || typeof element.closest !== 'function') return false
  if (element.closest('button') === null) return false
  return element.closest(OWN_KEYBOARD_SELECTOR) === null
}

/**
 * Put the focus back on the page from inside it. For a button that is about to be unmounted by its own press:
 * with the focus still on it, the document would get the focus and the shortcuts would be dead.
 */
export function returnFocusToPage(from: unknown): void {
  const element = asTarget(from)
  if (element === null || typeof element.closest !== 'function') return
  const page = asTarget(element.closest(PAGE_SELECTOR))
  page?.focus?.({ preventScroll: true })
}
