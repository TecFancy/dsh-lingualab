import { describe, expect, it } from 'vitest'
import { OWN_KEYBOARD_SELECTOR, PAGE_SELECTOR, activatesWithKeys, holdsMouseFocus, keepsKeyForTarget, returnFocusToPage, type FocusTarget } from './focus.ts'

/**
 * An element-shaped object. `inside` lists the selectors `closest` answers for, which is how a test says where the
 * element is: a button inside the settings drawer answers the drawer's selector.
 */
function element(tagName: string, extra: { type?: string; attributes?: Record<string, string>; inside?: readonly string[]; self?: boolean } = {}): FocusTarget {
  const inside = extra.inside ?? []
  const attributes = extra.attributes ?? {}
  const found = {}
  return {
    tagName: tagName.toUpperCase(),
    type: extra.type,
    getAttribute: (name) => attributes[name] ?? null,
    closest: (selector) => (inside.includes(selector) || (extra.self === true && selector === tagName.toLowerCase()) ? found : null),
  }
}

describe('activatesWithKeys', () => {
  it('is true for what the browser presses on Space and Enter', () => {
    expect(activatesWithKeys(element('button'))).toBe(true)
    expect(activatesWithKeys(element('summary'))).toBe(true)
    expect(activatesWithKeys(element('a', { attributes: { href: '#x' } }))).toBe(true)
    expect(activatesWithKeys(element('div', { attributes: { role: 'button' } }))).toBe(true)
    for (const type of ['checkbox', 'radio', 'button', 'submit', 'reset']) {
      expect(activatesWithKeys(element('input', { type }))).toBe(true)
    }
  })

  it('is false for the container, text fields, plain elements and a link without a target', () => {
    expect(activatesWithKeys(element('div'))).toBe(false)
    expect(activatesWithKeys(element('span'))).toBe(false)
    expect(activatesWithKeys(element('input', { type: 'text' }))).toBe(false)
    expect(activatesWithKeys(element('textarea'))).toBe(false)
    expect(activatesWithKeys(element('a'))).toBe(false)
    expect(activatesWithKeys(element('div', { attributes: { role: 'option' } }))).toBe(false)
    expect(activatesWithKeys(null)).toBe(false)
    expect(activatesWithKeys({})).toBe(false)
  })
})

describe('keepsKeyForTarget', () => {
  it('leaves Space and Enter on a button to the button', () => {
    expect(keepsKeyForTarget(element('button'), ' ')).toBe(true)
    expect(keepsKeyForTarget(element('button'), 'Enter')).toBe(true)
  })

  it('leaves every other key, and every key on the container, to the page', () => {
    for (const key of ['ArrowLeft', 'ArrowRight', 'l', 'r', 'Escape', 'Tab', '1']) {
      expect(keepsKeyForTarget(element('button'), key)).toBe(false)
    }
    expect(keepsKeyForTarget(element('div'), ' ')).toBe(false)
    expect(keepsKeyForTarget(element('div'), 'Enter')).toBe(false)
  })
})

describe('holdsMouseFocus', () => {
  it('holds the focus for a press on a button, or on something inside one', () => {
    expect(holdsMouseFocus(element('button', { self: true }))).toBe(true)
    // The icon or the kbd inside the peek button: the target is the child, the button is its ancestor.
    expect(holdsMouseFocus(element('svg', { inside: ['button'] }))).toBe(true)
  })

  it('does nothing for a press that is not on a button', () => {
    expect(holdsMouseFocus(element('div'))).toBe(false)
    expect(holdsMouseFocus(element('input', { type: 'checkbox' }))).toBe(false)
    expect(holdsMouseFocus(null)).toBe(false)
    expect(holdsMouseFocus({})).toBe(false)
  })

  it('leaves a button of a region that reads the keyboard itself alone', () => {
    expect(holdsMouseFocus(element('button', { self: true, inside: [OWN_KEYBOARD_SELECTOR] }))).toBe(false)
  })
})

describe('returnFocusToPage', () => {
  it('focuses the page element around the one given, without scrolling', () => {
    const calls: unknown[] = []
    const page: FocusTarget = { focus: (options) => calls.push(options) }
    const button: FocusTarget = { closest: (selector) => (selector === PAGE_SELECTOR ? page : null) }
    returnFocusToPage(button)
    expect(calls).toEqual([{ preventScroll: true }])
  })

  it('does nothing outside the page', () => {
    expect(() => returnFocusToPage({ closest: () => null })).not.toThrow()
    expect(() => returnFocusToPage(null)).not.toThrow()
  })
})
