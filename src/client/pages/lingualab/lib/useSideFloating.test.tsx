// @vitest-environment node
/**
 * The hook's guard, rendered to a string: without a DOM body and a `ResizeObserver` nothing floats, so the column stays
 * beside the stage. The measuring itself needs a layout engine, which these tests do not have; the threshold it reads is
 * tested in `side-column.test.ts`.
 */
import type { ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { useSideFloating } from './useSideFloating.ts'

const renderToStaticMarkup = render as (element: ReactElement) => string

function Probe() {
  return <span>{String(useSideFloating().narrow)}</span>
}

describe('useSideFloating', () => {
  it('says the row is wide while there is no measured body', () => {
    expect(renderToStaticMarkup(<Probe />)).toBe('<span>false</span>')
  })
})
