// @vitest-environment node
/**
 * The practice top bar's right side, rendered to static markup: two groups named by what their buttons act on, the
 * thin line between them, and the order the second group keeps at the far right.
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
  side: { collapsed: false, keptShown: false, toggleKept: noop, toggleCollapsed: noop },
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
  it('draws the right column group before the progress and settings group', () => {
    expect(html.match(/role="group"/g)).toHaveLength(2)
    const side = html.indexOf('aria-label="topGroupSide"')
    const progress = html.indexOf('aria-label="topGroupProgress"')
    const divider = html.indexOf('class="dsh-lingualab-top-divider"')
    expect(side).toBeGreaterThanOrEqual(0)
    expect(progress).toBeGreaterThan(side)
    expect(divider).toBeGreaterThan(side)
    expect(divider).toBeLessThan(progress)
    expect(html).toContain('class="dsh-lingualab-top-divider" aria-hidden="true"')
  })

  it('puts the kept chip and the column toggle in the right column group', () => {
    const side = group('topGroupSide')
    expect(side).toContain('title="keyColumn"')
    expect(side).toContain('aria-label="keySide"')
    expect(side).not.toContain('stepsChip')
    expect(side).not.toContain('aria-label="settingsTitle"')
  })

  it('puts the five steps and the settings in the last group, in that order', () => {
    const progress = group('topGroupProgress')
    const steps = progress.indexOf('stepsChip')
    const settings = progress.indexOf('aria-label="settingsTitle"')
    expect(steps).toBeGreaterThanOrEqual(0)
    expect(settings).toBeGreaterThan(steps)
    expect(progress).not.toContain('title="keyColumn"')
    expect(progress).not.toContain('aria-label="keySide"')
    // Nothing comes after this group but the bar's own closing tag.
    const after = html.slice(html.indexOf(progress) + progress.length)
    expect(after).not.toMatch(/<button|role="group"|dsh-lingualab-top-group/)
  })
})
