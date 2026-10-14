// @vitest-environment node
/**
 * What the player card's row draws, rendered to static markup. The timing mode (see the stylesheet) keeps one of its
 * buttons, the speed, and hides the rest by class, so the markup has to say which one that is.
 */
import type { ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ControlBar, shadowChipKey } from './ControlBar.tsx'

const renderToStaticMarkup = render as (element: ReactElement) => string

const t = (key: string): string => key
const noop = (): void => undefined

const html = (): string =>
  renderToStaticMarkup(
    <ControlBar
      t={t}
      zhMode="dim"
      onZhMode={noop}
      kept={false}
      onToggleKeep={noop}
      onRetime={noop}
      picture={{ mode: 'shown', onCycle: noop }}
      subtitles={{ episode: 'e', segment: null, state: undefined, onSaved: noop }}
    />,
  )

describe('the player card row', () => {
  it('marks the speed button, the one button of the sentence side that timing mode keeps', () => {
    const markup = html()
    expect(markup.match(/dsh-lingualab-bar-btn is-speed/g)).toHaveLength(1)
    expect(markup).toContain('title="speed"')
  })

  it('keeps the previous, play and next buttons in the middle group and the rest of the buttons in the two side groups', () => {
    const markup = html()
    const main = markup.slice(markup.indexOf('dsh-lingualab-transport-main'), markup.indexOf('dsh-lingualab-transport-side is-end'))
    expect(main.match(/dsh-lingualab-round/g)).toHaveLength(2)
    expect(main).toContain('dsh-lingualab-play')
    expect(main).not.toContain('dsh-lingualab-bar-btn')
  })

  it('names the shadowing chip by whose turn a pause gives, and by the mode otherwise', () => {
    expect(shadowChipKey(null)).toBe('shadowShort')
    expect(shadowChipKey({ index: 0, phase: 'speak', ms: 2500, until: 1 })).toBe('shadowSpeak')
    expect(shadowChipKey({ index: 0, phase: 'look', ms: 2500, until: 1 })).toBe('shadowLook')
  })

  it('says it is comparing while the sentence and then the take play, over any pause', () => {
    expect(shadowChipKey(null, { index: 0, stage: 'original', then: 'program' })).toBe('shadowCompare')
    expect(shadowChipKey(null, { index: 0, stage: 'take', then: 'stop' })).toBe('shadowCompare')
  })

  it('has no comparison button until recording is on or a take exists', () => {
    expect(html()).not.toContain('>compare<')
  })
})
