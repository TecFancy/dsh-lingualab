// @vitest-environment node
/**
 * The hook rendered to a string: a move that changes the collapse writes the setting, reading the collapse as it is
 * when the move is made. A string render reads a store's initial state and keeps no React state, so what is rendered
 * after a move is checked in a browser, and the moves themselves are tested in `side-column.test.ts`.
 */
import type { ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS, useSettings } from '../../../features/settings/index.ts'
import { useSideColumn, type SideColumn } from './useSideColumn.ts'

const renderToStaticMarkup = render as (element: ReactElement) => string

function setup(): SideColumn {
  let side: SideColumn | undefined
  function Probe() {
    side = useSideColumn()
    return <span>{side.column}</span>
  }
  renderToStaticMarkup(<Probe />)
  if (side === undefined) throw new Error('the hook did not render')
  return side
}

describe('useSideColumn', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => undefined })
    useSettings.setState({ ...DEFAULT_SETTINGS })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts on the subtitles, expanded by default', () => {
    const side = setup()
    expect(side).toMatchObject({ column: 'transcript', collapsed: false, keptShown: false })
  })

  it('writes the collapse when the toggle is pressed, both ways', () => {
    setup().toggleCollapsed()
    expect(useSettings.getState().sideCollapsed).toBe(true)
    setup().toggleCollapsed()
    expect(useSettings.getState().sideCollapsed).toBe(false)
  })

  it('expands a collapsed column for N and for a protected sentence', () => {
    useSettings.setState({ sideCollapsed: true })
    setup().toggleKept()
    expect(useSettings.getState().sideCollapsed).toBe(false)
    useSettings.setState({ sideCollapsed: true })
    setup().showKept()
    expect(useSettings.getState().sideCollapsed).toBe(false)
  })

  it('leaves the stored settings alone for a move that does not touch the collapse', () => {
    const setItem = vi.fn()
    vi.stubGlobal('localStorage', { getItem: () => null, setItem })
    setup().toggleKept()
    expect(setItem).not.toHaveBeenCalled()
  })
})
