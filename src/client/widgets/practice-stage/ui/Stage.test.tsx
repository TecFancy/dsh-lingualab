// @vitest-environment node
/**
 * What the stage says when it has no sentence to show, rendered to static markup (there is no DOM in these
 * tests, and none of the stage's effects change what it draws on the first render).
 */
import type { ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Cue } from '../../../entities/cue/index.ts'
import { Stage, type StageProps } from './Stage.tsx'

const renderToStaticMarkup = render as (element: ReactElement) => string

/** A translator that shows the key and its parameters, so the markup says which string was asked for. */
const t = (key: string, params?: Record<string, unknown>): string =>
  params === undefined ? key : `${key}[${Object.entries(params).map(([name, value]) => `${name}=${String(value)}`).join(';')}]`

/** Two sentences after an opening with no dialogue. */
const CUES: readonly Cue[] = [
  { start: 65, end: 67, text: 'Our job.' },
  { start: 68, end: 70, text: 'I have done our job.' },
]

function props(patch: Partial<StageProps> = {}): StageProps {
  return {
    t,
    cues: CUES,
    activeIndex: 0,
    zhMode: 'dim',
    masked: false,
    onReveal: () => undefined,
    onToggleWord: () => undefined,
    hasWord: () => false,
    loading: false,
    hasAudio: true,
    onRetime: () => undefined,
    retiming: false,
    ...patch,
  }
}

const draw = (patch: Partial<StageProps> = {}): string => renderToStaticMarkup(<Stage {...props(patch)} />)

describe('Stage without a sentence', () => {
  it('says when the first sentence starts while the opening plays', () => {
    const markup = draw({ activeIndex: -1 })
    expect(markup).toContain('beforeFirstCue[time=')
    expect(markup).toContain('beforeFirstCueHint')
    expect(markup).not.toContain('noSubtitles')
  })

  it('says there are no subtitles only when there are none', () => {
    const markup = draw({ cues: [], activeIndex: -1 })
    expect(markup).toContain('noSubtitles')
    expect(markup).not.toContain('beforeFirstCue')
  })

  it('shows the sentence once playback reaches it', () => {
    const markup = draw({ activeIndex: 0 })
    expect(markup).toContain('Our')
    expect(markup).not.toContain('beforeFirstCue')
    expect(markup).not.toContain('noSubtitles')
  })
})
