// @vitest-environment node
/**
 * The head of the transcript column, rendered to static markup. The follow switch has a long and a short word, and the
 * stylesheet picks the short one where the column is only 260px wide; the full word stays as the input's name.
 */
import type { ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SubtitlePanel } from './SubtitlePanel.tsx'

const renderToStaticMarkup = render as (element: ReactElement) => string

const t = (key: string): string => key
const noop = (): void => undefined

const html = (follow: boolean): string =>
  renderToStaticMarkup(
    <SubtitlePanel
      t={t}
      switcher={<span>switcher</span>}
      cues={[{ start: 1, end: 2, text: 'Hello.' }]}
      loading={false}
      activeIndex={0}
      selectedIndex={0}
      zhMode="dim"
      notedIndexes={new Set()}
      follow={follow}
      onFollow={noop}
      onSelect={noop}
      onPlay={noop}
      onKeep={noop}
    />,
  )

describe('the transcript head', () => {
  it('draws the follow switch with a long and a short word', () => {
    const markup = html(true)
    expect(markup).toContain('<span class="dsh-lingualab-label-long">follow</span>')
    expect(markup).toContain('<span class="dsh-lingualab-label-short">followShort</span>')
  })

  it('names the checkbox by the long word and explains it in the tooltip, whichever word is drawn', () => {
    const markup = html(false)
    expect(markup).toContain('aria-label="follow"')
    expect(markup).toContain('title="followHint"')
  })

  it('shows the state of the switch', () => {
    expect(html(true)).toContain('checked=""')
    expect(html(false)).not.toContain('checked=""')
  })
})
