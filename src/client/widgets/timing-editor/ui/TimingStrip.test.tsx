// @vitest-environment node
/**
 * What the timing panel draws, rendered to static markup (there is no DOM in these tests, and the panel's one effect
 * only matters when it closes). The layout itself is the stylesheet's, and `styles.test.ts` pins that; what is pinned
 * here is the markup the compact layout depends on: the long and the short label of a button, and the full name that
 * stays on the button whichever of them is drawn.
 */
import { Children } from 'react'
import type { ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Cue } from '../../../entities/cue/index.ts'
import { TimingStrip } from './TimingStrip.tsx'
import { TimingStepButtons } from './TimingStepButtons.tsx'
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
    canStepPrevious: true,
    canStepNext: true,
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
    moving: false,
    savedNotice: false,
    error: null,
    stale: false,
    open: noop,
    step: noop,
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

/** What the page's presence says: on the page and open by default; `mounted` and `shown` are the page's to give. */
const html = (
  patch: Partial<TimingEditor> = {},
  presence: { mounted?: boolean; shown?: boolean } = {},
  blocked: string | null = null,
): string =>
  renderToStaticMarkup(
    <TimingStrip
      t={t}
      editor={editor(patch)}
      blocked={blocked}
      mounted={presence.mounted ?? true}
      shown={presence.shown ?? true}
    />,
  )

/** The opening tag of the button with this title, so a test can read its attributes. */
function buttonTag(markup: string, label: string): string {
  return markup.match(new RegExp(`<button(?=[^>]*title="${label}")[^>]*>`))?.[0] ?? ''
}

describe('the timing panel', () => {
  it('is on the page when the page mounts it, and not otherwise', () => {
    expect(html({}, { mounted: true })).toContain('dsh-lingualab-timing-wrap')
    expect(html({}, { mounted: false, shown: false })).toBe('')
    // Without a session held there is nothing to draw, even for a page that says it is mounted.
    expect(html({ session: null }, { mounted: true })).toBe('')
  })

  it('takes its open look and its keys from the page, not from its own timer', () => {
    const open = html({}, { shown: true })
    expect(open).toContain('class="dsh-lingualab-timing-wrap is-open"')
    expect(open).toContain('aria-hidden="false"')
    expect(open).not.toContain('inert')
    // Mounted but not shown (fading in, or on its way out): the same full-height wrap, closed look, out of reach.
    const leaving = html({}, { mounted: true, shown: false })
    expect(leaving).toContain('class="dsh-lingualab-timing-wrap"')
    expect(leaving).not.toContain('is-open')
    expect(leaving).toContain('aria-hidden="true"')
    expect(leaving).toContain('inert=""')
  })

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

  it('disables the neighbour button on the side where the list ends', () => {
    const start = html({ session: session({ canStepPrevious: false }) })
    expect(buttonTag(start, 'prevCue')).toContain('disabled=""')
    expect(buttonTag(start, 'nextCue')).not.toContain('disabled=""')
    const end = html({ session: session({ canStepNext: false }) })
    expect(buttonTag(end, 'prevCue')).not.toContain('disabled=""')
    expect(buttonTag(end, 'nextCue')).toContain('disabled=""')
  })

  it('keeps both neighbour buttons usable while a changed range will be saved first', () => {
    const markup = html({ session: session({ range: { start: 68100, end: 70000 } }) })
    expect(buttonTag(markup, 'prevCue')).not.toContain('disabled=""')
    expect(buttonTag(markup, 'nextCue')).not.toContain('disabled=""')
  })

  it('disables both neighbour buttons while the move is saving', () => {
    const markup = html({ saving: true, session: session({ range: { start: 68100, end: 70000 } }) })
    expect(buttonTag(markup, 'prevCue')).toContain('disabled=""')
    expect(buttonTag(markup, 'nextCue')).toContain('disabled=""')
  })

  it('says that the move saved in the header status', () => {
    const markup = html({ savedNotice: true })
    expect(markup).toContain('role="status"')
    expect(markup).toContain('>saved<')
  })

  it('leaves both neighbour buttons usable when the episode cannot be saved', () => {
    const markup = html({ session: session({ range: { start: 68100, end: 70000 } }) }, {}, 'outside the library')
    expect(buttonTag(markup, 'prevCue')).not.toContain('disabled=""')
    expect(buttonTag(markup, 'nextCue')).not.toContain('disabled=""')
  })

  it('asks the editor to step in the direction of the button pressed', () => {
    const directions: number[] = []
    const rendered = TimingStepButtons({
      t,
      editor: editor({ step: (direction) => directions.push(direction) }),
      session: session(),
      canStep: true,
    })
    const buttons = Children.toArray(rendered.props.children) as ReactElement<{ onClick: () => void }>[]
    for (const button of buttons) button.props.onClick()
    expect(directions).toEqual([-1, 1])
  })
})
