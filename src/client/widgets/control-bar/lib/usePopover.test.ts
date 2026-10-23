// @vitest-environment node
/**
 * The outside-press listener behind `usePopover`. The repository renders components to strings, so an effect does not
 * run in a component test; this exercises the effect's body, including when it is not attached at all.
 */
import { describe, expect, it, vi } from 'vitest'
import { watchOutside } from './usePopover.ts'

/** A window stand-in that records the `mousedown` listeners it holds. */
class Presses {
  private readonly listeners = new Set<(event: Event) => void>()

  get count(): number {
    return this.listeners.size
  }

  addEventListener(type: string, listener: (event: Event) => void): void {
    if (type === 'mousedown') this.listeners.add(listener)
  }

  removeEventListener(type: string, listener: (event: Event) => void): void {
    if (type === 'mousedown') this.listeners.delete(listener)
  }

  press(target: object): void {
    for (const listener of this.listeners) listener({ target } as unknown as Event)
  }
}

/** The holder that contains `inside` and nothing else. */
function holderFor(inside: object): Pick<HTMLElement, 'contains'> {
  return { contains: (node: Node) => node === inside }
}

const asTarget = (presses: Presses): EventTarget => presses as unknown as EventTarget

describe('a popover press outside its holder', () => {
  it('closes when the press lands outside the holder', () => {
    const close = vi.fn()
    const presses = new Presses()
    const holder = holderFor({ name: 'inside' })
    watchOutside(true, holder, close, asTarget(presses))

    presses.press({ name: 'outside' })
    expect(close).toHaveBeenCalledOnce()
  })

  it('stays open when the press lands inside the holder', () => {
    const close = vi.fn()
    const presses = new Presses()
    const inside = { name: 'inside' }
    watchOutside(true, holderFor(inside), close, asTarget(presses))

    presses.press(inside)
    expect(close).not.toHaveBeenCalled()
  })

  it('adds no listener while the popover is closed', () => {
    const close = vi.fn()
    const presses = new Presses()
    watchOutside(false, holderFor({ name: 'inside' }), close, asTarget(presses))

    expect(presses.count).toBe(0)
    presses.press({ name: 'outside' })
    expect(close).not.toHaveBeenCalled()
  })

  it('removes the listener when it closes, so a later press does nothing', () => {
    const close = vi.fn()
    const presses = new Presses()
    const stop = watchOutside(true, holderFor({ name: 'inside' }), close, asTarget(presses))
    expect(presses.count).toBe(1)

    stop?.()
    expect(presses.count).toBe(0)
    presses.press({ name: 'outside' })
    expect(close).not.toHaveBeenCalled()
  })
})
