// @vitest-environment node
/**
 * The move a save leaves behind, rendered to a string: effects do not run in a string render, so the
 * arrival of the new cue list is driven through `arrive`, the callback the effect calls. What is
 * pinned is when the neighbour opens: only after a list that is not the saved one, only at the same
 * length, and never after a refusal.
 */
import type { ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Cue } from '../../../entities/cue/index.ts'
import { useStepAfterSave, type StepAfterSave } from './useStepAfterSave.ts'

const renderToStaticMarkup = render as (element: ReactElement) => string

const oldCues: readonly Cue[] = [
  { start: 10, end: 12, text: 'One' },
  { start: 20, end: 22, text: 'Two' },
  { start: 30, end: 32, text: 'Three' },
]

const movedCues: readonly Cue[] = [
  { start: 10, end: 12, text: 'One' },
  { start: 18, end: 22, text: 'Two' },
  { start: 30, end: 32, text: 'Three' },
]

function setup(): { step: StepAfterSave; open: ReturnType<typeof vi.fn>; settle: ReturnType<typeof vi.fn> } {
  const open = vi.fn()
  const settle = vi.fn()
  let step: StepAfterSave | undefined
  function Probe() {
    step = useStepAfterSave({ cues: oldCues, open, settle })
    return <span>probe</span>
  }
  renderToStaticMarkup(<Probe />)
  if (step === undefined) throw new Error('the hook did not render')
  return { step, open, settle }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('useStepAfterSave', () => {
  it('opens the neighbour only when a new cue list arrives, keeping the focused edge', () => {
    const { step, open, settle } = setup()
    step.begin(2, 'end', oldCues)
    expect(open).not.toHaveBeenCalled()
    // The same list is still the saved one: there is nothing to open yet.
    step.arrive(oldCues)
    expect(open).not.toHaveBeenCalled()
    expect(settle).not.toHaveBeenCalled()
    step.arrive(movedCues)
    expect(open).toHaveBeenCalledWith(2, 'end')
    expect(settle).toHaveBeenCalledTimes(1)
    step.clearNotice()
  })

  it('does not move when the save was refused', () => {
    const { step, open, settle } = setup()
    step.begin(2, 'end', oldCues)
    step.cancel()
    step.arrive(movedCues)
    expect(open).not.toHaveBeenCalled()
    expect(settle).not.toHaveBeenCalled()
  })

  it('gives the move up when the new list holds a different number of sentences', () => {
    const { step, open, settle } = setup()
    step.begin(2, 'end', oldCues)
    step.arrive(movedCues.slice(0, 2))
    expect(open).not.toHaveBeenCalled()
    expect(settle).toHaveBeenCalledTimes(1)
  })
})
