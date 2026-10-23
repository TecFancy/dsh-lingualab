// @vitest-environment node
/**
 * The hook rendered to a string: a move that changes the collapse writes the setting once the device has a choice, and
 * otherwise keeps it for this visit, reading the collapse as it is when the move is made. A string render reads a
 * store's initial state and keeps no React state, so what is rendered after a move is checked in a browser, and the
 * moves themselves are tested in `side-column.test.ts`.
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

  it('starts on the subtitles, expanded with no stored choice and a wide row', () => {
    const side = setup()
    expect(side).toMatchObject({ column: 'transcript', collapsed: false, keptShown: false })
  })

  it('does not float before the row has been measured', () => {
    const side = setup()
    expect(side.floating).toBe(false)
    expect(side.row).toMatchObject({ collapsed: false, floating: false })
  })

  it('keeps a collapse this visit only while the device has no choice', () => {
    const setItem = vi.fn()
    vi.stubGlobal('localStorage', { getItem: () => null, setItem })
    const side = setup()
    side.collapse()
    expect(useSettings.getState().sideCollapsed).toBeNull()
    expect(setItem).not.toHaveBeenCalled()
  })

  it('reads the collapse this visit made when the next move is in the same frame', () => {
    const setItem = vi.fn()
    vi.stubGlobal('localStorage', { getItem: () => null, setItem })
    const side = setup()
    side.collapse()
    // The toggle reads the collapse it just made, so it stores the expanded result and not the state before it.
    side.toggleCollapsed()
    expect(useSettings.getState().sideCollapsed).toBe(false)
    expect(setItem).toHaveBeenCalledTimes(1)
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

  it('stores nothing when N switches the view without changing the collapse', () => {
    useSettings.setState({ sideCollapsed: null })
    const side = setup()
    side.toggleKept()
    expect(useSettings.getState().sideCollapsed).toBeNull()
  })

  it('leaves the stored settings alone for a move that does not touch the collapse', () => {
    const setItem = vi.fn()
    vi.stubGlobal('localStorage', { getItem: () => null, setItem })
    setup().toggleKept()
    expect(setItem).not.toHaveBeenCalled()
  })
})
