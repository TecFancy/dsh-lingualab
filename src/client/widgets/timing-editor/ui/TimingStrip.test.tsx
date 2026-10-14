// @vitest-environment node
/**
 * What the timing panel draws, rendered to static markup (there is no DOM in these tests, and the panel's one effect
 * only matters when it closes). The layout itself is the stylesheet's, and `styles.test.ts` pins that; what is pinned
 * here is the markup the compact layout depends on: the long and the short label of a button, and the full name that
 * stays on the button whichever of them is drawn.
 */
import type { ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Cue } from '../../../entities/cue/index.ts'
import { TimingStrip } from './TimingStrip.tsx'
import type { TimingEditor, TimingSession } from '../model/useTimingEditor.ts'

const renderToStaticMarkup = render as (element: ReactElement) => string

/** A translator that shows the key and its parameters, so the markup says which string was asked for. */
const t = (key: string, params?: Record<string, unknown>): string =>
  params === undefined ? key : `${key}[${Object.entries(params).map(([name, value]) => `${name}=${String(value)}`).join(';')}]`

const noop = (): void => undefined

const CUE: Cue = { start: 68, end: 70, text: 'I have done our job.' }

function session(patch: Partial<TimingSession> = {}): TimingSession {
  return {
    index: 1,
    cue: CUE,
    range: { start: 68000, end: 70000 },
    base: { start: 68000, end: 70000 },
    focus: 'start',
    limits: { minStart: 67000, maxStart: 69000, minEnd: 69000, maxEnd: 71000, endEditable: true },
    lrc: false,
    pushed: [],
    previous: { start: 65000, end: 67000 },
    next: { start: 71000, end: 73000 },
    ...patch,
  }
}

function editor(patch: Partial<TimingEditor> = {}): TimingEditor {
  return {
    session: session(),
    saving: false,
    error: null,
    stale: false,
    open: noop,
    close: noop,
    setFocus: noop,
    nudge: noop,
    toPlayhead: noop,
    reset: noop,
    save: noop,
    reloadStale: noop,
    handleKey: () => false,
    ...patch,
  }
}

const html = (patch: Partial<TimingEditor> = {}): string =>
  renderToStaticMarkup(<TimingStrip t={t} editor={editor(patch)} blocked={null} />)

describe('the timing panel', () => {
  it('draws both labels of the playhead button and keeps the full one as its name', () => {
    const markup = html()
    expect(markup).toContain('<span class="dsh-lingualab-label-long">timingAtPlayhead</span>')
    expect(markup).toContain('<span class="dsh-lingualab-label-short">timingAtPlayheadShort</span>')
    // One button per editable edge, each named in full for a screen reader and a tooltip.
    expect(markup.match(/aria-label="timingAtPlayhead"/g)).toHaveLength(2)
    expect(markup.match(/title="timingAtPlayhead"/g)).toHaveLength(2)
  })

  it('draws both labels of the save button and keeps the full one as its name', () => {
    const markup = html({ session: session({ range: { start: 68100, end: 70000 } }) })
    expect(markup).toContain('<span class="dsh-lingualab-label-long">timingSave</span>')
    expect(markup).toContain('<span class="dsh-lingualab-label-short">timingSaveShort</span>')
    expect(markup).toContain('aria-label="timingSave"')
    expect(markup).toContain('title="timingSave (Enter)"')
  })

  it('names the save button by what it is doing while it saves, not by the full label', () => {
    const markup = html({ saving: true })
    expect(markup).toContain('saving…')
    expect(markup).not.toContain('aria-label="timingSave"')
    expect(markup).not.toContain('timingSaveShort')
  })

  it('has no playhead button on an end that cannot be moved', () => {
    const markup = html({
      session: session({ lrc: true, limits: { minStart: 0, maxStart: 1, minEnd: 0, maxEnd: 1, endEditable: false } }),
    })
    expect(markup.match(/timingAtPlayheadShort/g)).toHaveLength(1)
  })
})
