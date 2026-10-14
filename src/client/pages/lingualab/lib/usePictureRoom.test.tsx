// @vitest-environment node
/**
 * The hook's guard, rendered to a string: without a DOM or a `ResizeObserver` (and before the scroller is on the page)
 * the picture is taken to fit and nothing is attached. The measuring itself needs a layout engine, which these tests do
 * not have, so its sum and its band are tested in `picture-room.test.ts`.
 */
import type { ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { usePictureRoom } from './usePictureRoom.ts'

const renderToStaticMarkup = render as (element: ReactElement) => string

function Probe({ active }: { readonly active: boolean }) {
  return <span>{String(usePictureRoom(null, active))}</span>
}

describe('usePictureRoom', () => {
  it('says the picture fits while there is no scroller to measure', () => {
    expect(renderToStaticMarkup(<Probe active />)).toBe('<span>true</span>')
    expect(renderToStaticMarkup(<Probe active={false} />)).toBe('<span>true</span>')
  })
})
