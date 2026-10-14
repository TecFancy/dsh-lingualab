// @vitest-environment node
/**
 * The hook's guard, rendered to a string: without a DOM or a `ResizeObserver` (and before the scroller is on the page) it
 * attaches nothing and the card is drawn whole. The trial itself needs a layout engine, which these tests do not have, so its
 * choice and the classes it leaves on the scroller are tested in `card-fit.test.ts`.
 */
import type { ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { useCardFit } from './useCardFit.ts'

const renderToStaticMarkup = render as (element: ReactElement) => string

function Probe({ active }: { readonly active: boolean }) {
  useCardFit(null, active)
  return <span>drawn</span>
}

describe('useCardFit', () => {
  it('does nothing while there is no scroller to measure', () => {
    expect(renderToStaticMarkup(<Probe active />)).toBe('<span>drawn</span>')
    expect(renderToStaticMarkup(<Probe active={false} />)).toBe('<span>drawn</span>')
  })
})
