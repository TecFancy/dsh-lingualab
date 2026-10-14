// @vitest-environment node
import { createElement, type ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { prefersReducedMotion, presenceDelay, usePresence } from './usePresence.ts'

const renderToStaticMarkup = render as (element: ReactElement) => string

/** Draws what the hook answers, as `mounted/shown`. */
function Probe({ open }: { readonly open: boolean }) {
  const { mounted, shown } = usePresence(open, 240)
  return createElement('span', null, `${String(mounted)}/${String(shown)}`)
}

// The hook itself needs a DOM to run in, and this repository tests without one (no jsdom, no
// renderer), so what is checked here is the part that decides its timing.

describe('usePresence', () => {
  it('is mounted in the very render that is open, and not yet shown, so the closed look is painted first', () => {
    expect(renderToStaticMarkup(createElement(Probe, { open: true }))).toBe('<span>true/false</span>')
  })

  it('is neither mounted nor shown while closed', () => {
    expect(renderToStaticMarkup(createElement(Probe, { open: false }))).toBe('<span>false/false</span>')
  })
})

describe('presenceDelay', () => {
  it('keeps the element for the length of the way out', () => {
    expect(presenceDelay(240, false)).toBe(240)
    expect(presenceDelay(200, false)).toBe(200)
  })

  it('lets go at once when motion is reduced, and never goes negative', () => {
    expect(presenceDelay(240, true)).toBe(0)
    expect(presenceDelay(-5, false)).toBe(0)
  })
})

describe('prefersReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('answers false where there is no window to ask', () => {
    expect(prefersReducedMotion()).toBe(false)
  })

  it('answers false where the window cannot be asked', () => {
    vi.stubGlobal('window', {})
    expect(prefersReducedMotion()).toBe(false)
  })

  it('reads the system setting', () => {
    vi.stubGlobal('window', { matchMedia: (query: string) => ({ matches: query.includes('reduce') }) })
    expect(prefersReducedMotion()).toBe(true)
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) })
    expect(prefersReducedMotion()).toBe(false)
  })
})
