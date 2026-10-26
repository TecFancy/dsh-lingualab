// @vitest-environment node
/**
 * What the stage's five steps say in each state, rendered to static markup: what a done step took, the
 * suggested and used time on the step to do next, and only the suggestion on the rest.
 */
import type { ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { StepStrip } from './StepStrip.tsx'

const renderToStaticMarkup = render as (element: ReactElement) => string

/** A translator that shows the key and its parameters, so the markup says which string was asked for. */
const t = (key: string, params?: Record<string, unknown>): string =>
  params === undefined
    ? key
    : `${key}[${Object.entries(params)
        .map(([name, value]) => `${name}=${String(value)}`)
        .join(';')}]`

describe('the step strip', () => {
  const html = renderToStaticMarkup(
    <StepStrip
      t={t}
      records={{ blind: { done: true, seconds: 1290 }, read: { done: true, seconds: 0 }, shadow: { done: false, seconds: 182 } }}
    />,
  )

  it('counts the ticked steps', () => {
    expect(html).toContain('stepsProgress[done=2;total=5]')
  })

  it('says what a done step took, or that it is done when it was not timed', () => {
    expect(html).toContain('stepTook[clock=21:30]')
    expect(html).toContain('homeStepDone')
  })

  it('marks the step to do next, with its suggestion and the time used so far', () => {
    expect(html).toContain('aria-current="step"')
    expect(html).toContain('stepSuggested[minutes=10] · stepUsed[clock=3:02]')
    expect(html.match(/aria-current/g)).toHaveLength(1)
  })

  it('gives the steps still to come only the suggestion', () => {
    expect(html).toContain('stepSuggested[minutes=3]')
    expect(html).toContain('stepSuggested[minutes=15]')
  })
})
