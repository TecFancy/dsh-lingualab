// @vitest-environment node
/**
 * What the right column's slot draws at each point of its presence, and how long the page keeps it for its way out.
 *
 * The repository renders components to static markup rather than into a DOM, so `PracticeSideSlotFrame` is the part
 * that can be read here: the closed look it holds while leaving, the open look, and no slot at all. The timer side is
 * `usePresence`'s; its contract is `presenceDelay(SIDE_MS, reducedMotion)`, and the boundaries below are what the
 * component passes to it, checked with fake timers.
 */
import type { ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { presenceDelay } from '../../../shared/lib/usePresence.ts'
import { PracticeSideSlot, PracticeSideSlotFrame, SIDE_MS } from './PracticeSideSlot.tsx'

const renderToStaticMarkup = render as (element: ReactElement) => string

const noop = (): void => undefined

/** The slot at one point of its presence, with a list inside it. */
const html = (mounted: boolean, shown: boolean, floating = false): string =>
  renderToStaticMarkup(
    <PracticeSideSlotFrame
      mounted={mounted}
      shown={shown}
      floating={floating}
      scrimLabel="closeSide"
      onScrim={noop}
    >
      <p className="sentence">I have done our job.</p>
    </PracticeSideSlotFrame>,
  )

/** The opening tag of the slot, so a test can read its classes and ARIA. */
function slotTag(markup: string): string {
  return markup.match(/<div[^>]*class="dsh-lingualab-side-slot[^"]*"[^>]*>/)?.[0] ?? ''
}

describe('the right column slot', () => {
  it('is not on the page once the way out is over', () => {
    expect(html(false, false)).toBe('')
  })

  it('holds the list, without its open look and out of reach, while it leaves', () => {
    const leaving = html(true, false)
    expect(leaving).toContain('class="sentence"')
    expect(slotTag(leaving)).toContain('class="dsh-lingualab-side-slot"')
    expect(slotTag(leaving)).not.toContain('is-open')
    expect(slotTag(leaving)).toContain('aria-hidden="true"')
  })

  it('takes its open look and becomes reachable when the presence shows it', () => {
    const open = html(true, true)
    expect(open).toContain('class="sentence"')
    expect(slotTag(open)).toContain('is-open')
    expect(slotTag(open)).toContain('aria-hidden="false"')
  })

  it('keeps saying it floats while the drawer leaves, because the row is still narrow', () => {
    const leaving = html(true, false, true)
    expect(slotTag(leaving)).toContain('is-floating')
    expect(slotTag(leaving)).not.toContain('is-open')
    // The scrim leaves on the same presence, and cannot be pressed or tabbed to while it fades.
    expect(leaving).toContain('class="dsh-lingualab-side-scrim"')
    expect(leaving).toContain('aria-hidden="true"')
    expect(leaving).toContain('tabindex="-1"')
  })

  it('draws the scrim open with the drawer, and only on a narrow row', () => {
    const open = html(true, true, true)
    expect(slotTag(open)).toContain('class="dsh-lingualab-side-slot is-open is-floating"')
    expect(open).toContain('class="dsh-lingualab-side-scrim is-open"')
    expect(open).toContain('tabindex="0"')
    expect(html(true, true, false)).not.toContain('dsh-lingualab-side-scrim')
  })

  it('mounts on the frame it opens, closed, and gives the list back only when the presence shows it', () => {
    expect(renderToStaticMarkup(
      <PracticeSideSlot open={false} floating={false} scrimLabel="closeSide" onScrim={noop}>
        <p className="sentence">I have done our job.</p>
      </PracticeSideSlot>,
    )).toBe('')
    const opening = renderToStaticMarkup(
      <PracticeSideSlot open floating={false} scrimLabel="closeSide" onScrim={noop}>
        <p className="sentence">I have done our job.</p>
      </PracticeSideSlot>,
    )
    expect(opening).toContain('class="sentence"')
    expect(slotTag(opening)).toContain('class="dsh-lingualab-side-slot"')
    expect(slotTag(opening)).not.toContain('is-open')
  })
})

describe('the way out', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('is 200ms, the same as the stylesheet .2s', () => {
    expect(SIDE_MS).toBe(200)
  })

  it('keeps the slot for the whole 200ms and lets go at the end of it', () => {
    vi.useFakeTimers()
    const drop = vi.fn()
    setTimeout(drop, presenceDelay(SIDE_MS, false))
    vi.advanceTimersByTime(SIDE_MS - 1)
    expect(drop).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(drop).toHaveBeenCalledTimes(1)
  })

  it('drops the slot at once when the reader asked for less motion', () => {
    vi.useFakeTimers()
    const drop = vi.fn()
    setTimeout(drop, presenceDelay(SIDE_MS, true))
    vi.runOnlyPendingTimers()
    expect(drop).toHaveBeenCalledTimes(1)
  })
})
