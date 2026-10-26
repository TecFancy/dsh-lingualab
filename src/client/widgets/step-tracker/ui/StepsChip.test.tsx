// @vitest-environment node
/**
 * The five steps' chip, rendered to static markup: which step it names, its clock, and its five bars.
 */
import type { ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { StepsChip, type StepsChipProps } from './StepsChip.tsx'

const renderToStaticMarkup = render as (element: ReactElement) => string

/** Prints the key and its values, so the markup shows what was asked for. */
const t = (key: string, vars?: Record<string, unknown>): string =>
  vars === undefined ? key : `${key}(${Object.entries(vars).map(([name, value]) => `${name}=${String(value)}`).join(',')})`

const done = { done: true, seconds: 0 }
const chip = (props: Partial<StepsChipProps>): string =>
  renderToStaticMarkup(<StepsChip t={t} records={{}} running={null} open={false} onToggle={() => undefined} {...props} />)

describe('the five steps chip', () => {
  it('names the first step not ticked, with the count, and no clock while none runs', () => {
    const html = chip({ records: { blind: done, read: done } })
    expect(html).toContain('aria-label="stepsChip(done=2,total=5,step=stepShadow)"')
    expect(html).toContain('<span class="dsh-lingualab-chip-text">stepShadow</span>')
    expect(html).not.toContain('dsh-lingualab-chip-clock')
  })

  it('names the running step and shows its clock, even when an earlier step is not ticked', () => {
    const html = chip({ records: { read: { done: false, seconds: 182 } }, running: 'read' })
    expect(html).toContain('step=stepRead 3:02')
    expect(html).toContain('<span class="dsh-lingualab-chip-clock">3:02</span>')
    expect(html.match(/chip-bar is-now/g)).toHaveLength(1)
    expect(html.indexOf('is-now')).toBeGreaterThan(html.indexOf('is-todo'))
  })

  it('says done once all five are ticked', () => {
    const all = { blind: done, read: done, shadow: done, 'next-day': done, weekly: done }
    const html = chip({ records: all })
    expect(html).toContain('stepsChipDone')
    expect(html.match(/chip-bar is-done/g)).toHaveLength(5)
  })

  it('reads as pressed while the drawer is open', () => {
    expect(chip({ open: true })).toContain('class="dsh-lingualab-chip is-on"')
    expect(chip({ open: true })).toContain('aria-expanded="true"')
  })
})
