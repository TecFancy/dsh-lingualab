// @vitest-environment node
/**
 * The practice top bar's right side, rendered to static markup: the five steps, the thin line, and the two icon
 * buttons at the far right, with the kept count on the column's toggle while the column is collapsed.
 *
 * The repository renders components to static markup rather than into a DOM, so what a screen reader names and in
 * what order the parts come is read from the markup.
 */
import type { ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { EpisodeEntry } from '../../../shared/protocol.ts'
import { PracticeTopBar, type PracticeTopBarProps } from './PracticeTopBar.tsx'

const renderToStaticMarkup = render as (element: ReactElement) => string

const t = (key: string): string => key
const noop = (): void => undefined

const episode: EpisodeEntry = {
  id: 'E1',
  title: 'An episode',
  audio: 'E1.mp3',
  audioBytes: 1,
  subtitleEn: null,
  subtitleZh: null,
  video: null,
  segments: [],
  notes: { exists: false, count: 0, review: 0, hard: 0 },
  kind: 'folder',
  source: 'library/E1',
}

const props: PracticeTopBarProps = {
  t,
  episode,
  segment: null,
  segments: [],
  finishedIds: new Set(),
  segmentsOpen: false,
  sentence: null,
  side: { collapsed: false, toggleCollapsed: noop },
  keptCount: 0,
  stepsOpen: false,
  settings: <button type="button" aria-label={t('settingsTitle')}>settings</button>,
  onHome: noop,
  onToggleSegments: noop,
  onCloseSegments: noop,
  onSelectSegment: noop,
  onToggleSteps: noop,
  onBlindRunning: noop,
}

const html = renderToStaticMarkup(<PracticeTopBar {...props} />)

/** The whole markup of the group with the accessible name `name`, from its opening tag to its matching close. */
function group(name: string): string {
  const start = html.indexOf(`aria-label="${name}"`)
  expect(start).toBeGreaterThanOrEqual(0)
  const open = html.lastIndexOf('<div', start)
  let depth = 0
  for (let at = open; at < html.length; at += 1) {
    if (html.startsWith('<div', at)) depth += 1
    if (html.startsWith('</div>', at)) {
      depth -= 1
      if (depth === 0) return html.slice(open, at + '</div>'.length)
    }
  }
  throw new Error(`unclosed group ${name}`)
}

describe('the practice top bar right side', () => {
  it('draws the five steps group, the thin line, then the tools group', () => {
    expect(html.match(/role="group"/g)).toHaveLength(2)
    const steps = html.indexOf('aria-label="topGroupSteps"')
    const tools = html.indexOf('aria-label="topGroupTools"')
    const divider = html.indexOf('class="dsh-lingualab-top-divider"')
    expect(steps).toBeGreaterThanOrEqual(0)
    expect(divider).toBeGreaterThan(steps)
    expect(tools).toBeGreaterThan(divider)
    expect(html).toContain('class="dsh-lingualab-top-divider" aria-hidden="true"')
  })

  it('puts only the five steps in the first group', () => {
    const steps = group('topGroupSteps')
    expect(steps).toContain('aria-label="stepsChip"')
    expect(steps).not.toContain('aria-label="keySide"')
    expect(steps).not.toContain('aria-label="settingsTitle"')
  })

  it('has no button of its own for the kept sentences', () => {
    expect(html).not.toContain('title="keyColumn"')
    expect(html).not.toContain('columnKept')
  })

  it('ends with the column toggle and the settings, in that order', () => {
    const tools = group('topGroupTools')
    const toggle = tools.indexOf('aria-label="keySide"')
    const settings = tools.indexOf('aria-label="settingsTitle"')
    expect(toggle).toBeGreaterThanOrEqual(0)
    expect(settings).toBeGreaterThan(toggle)
    // Nothing comes after this group but the bar's own closing tag.
    const after = html.slice(html.indexOf(tools) + tools.length)
    expect(after).not.toMatch(/<button|role="group"|dsh-lingualab-top-group/)
  })

  it('shows the kept count on the toggle only while the column is collapsed', () => {
    const side = (collapsed: boolean) => ({ collapsed, toggleCollapsed: noop })
    const collapsed = renderToStaticMarkup(<PracticeTopBar {...props} side={side(true)} keptCount={2} />)
    expect(collapsed).toContain('aria-label="keySide · columnKept 2"')
    expect(collapsed).toMatch(/dsh-lingualab-icon-badge[^>]*>2</)
    const open = renderToStaticMarkup(<PracticeTopBar {...props} side={side(false)} keptCount={2} />)
    expect(open).not.toContain('dsh-lingualab-icon-badge')
    const none = renderToStaticMarkup(<PracticeTopBar {...props} side={side(true)} keptCount={0} />)
    expect(none).not.toContain('dsh-lingualab-icon-badge')
  })
})
