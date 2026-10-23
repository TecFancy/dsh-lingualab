// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { collapseFor, collapseTarget, keptShown, showKept, sideFloats, toggleCollapsed, toggleKept, type SideState } from './side-column.ts'

const open = (column: SideState['column']): SideState => ({ column, collapsed: false })
const closed = (column: SideState['column']): SideState => ({ column, collapsed: true })

describe('the right column', () => {
  it('switches the view with N on an expanded column, as before', () => {
    expect(toggleKept(open('transcript'))).toEqual(open('kept'))
    expect(toggleKept(open('kept'))).toEqual(open('transcript'))
  })

  it('opens a collapsed column straight into the kept sentences, whichever view it had', () => {
    expect(toggleKept(closed('transcript'))).toEqual(open('kept'))
    expect(toggleKept(closed('kept'))).toEqual(open('kept'))
  })

  it('collapses and expands without forgetting the view', () => {
    expect(toggleCollapsed(open('kept'))).toEqual(closed('kept'))
    expect(toggleCollapsed(closed('kept'))).toEqual(open('kept'))
    expect(toggleCollapsed(open('transcript'))).toEqual(closed('transcript'))
    expect(toggleCollapsed(closed('transcript'))).toEqual(open('transcript'))
  })

  it('shows the kept sentences expanded, for a protected sentence', () => {
    expect(showKept()).toEqual(open('kept'))
  })

  it('reads the kept chip as pressed only while the kept sentences are on screen', () => {
    expect(keptShown(open('kept'))).toBe(true)
    expect(keptShown(closed('kept'))).toBe(false)
    expect(keptShown(open('transcript'))).toBe(false)
  })

  it('floats under 982px, the row width where the stage would lose its 600px content box', () => {
    expect(sideFloats(0)).toBe(true)
    expect(sideFloats(981)).toBe(true)
    expect(sideFloats(982)).toBe(false)
    expect(sideFloats(1200)).toBe(false)
  })
})

describe('the collapse in use', () => {
  it('takes this visit first, then the stored choice, then the row', () => {
    expect(collapseFor(true, false, false)).toBe(true)
    expect(collapseFor(false, true, true)).toBe(false)
    expect(collapseFor(null, true, false)).toBe(true)
    expect(collapseFor(null, false, true)).toBe(false)
    expect(collapseFor(null, null, true)).toBe(true)
    expect(collapseFor(null, null, false)).toBe(false)
  })

  it('stores the top bar toggle, and the other moves only once the device has a choice', () => {
    expect(collapseTarget(false, true, null, true)).toBe('stored')
    expect(collapseTarget(true, true, null, true)).toBe('stored')
    expect(collapseTarget(false, true, null, false)).toBe('visit')
    expect(collapseTarget(false, true, false, false)).toBe('stored')
    expect(collapseTarget(false, true, true, false)).toBe('stored')
    expect(collapseTarget(false, false, null, false)).toBe('none')
  })
})
