// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { currentStep, practiceStatus, STEPS, stepsDone } from './steps.ts'

const done = { done: true, seconds: 0 }
const timed = { done: false, seconds: 90 }

describe('the five steps', () => {
  it('counts only the ticked steps that are one of the five', () => {
    expect(stepsDone({})).toBe(0)
    expect(stepsDone({ blind: done, read: timed, stray: done })).toBe(1)
  })

  it('names the first step not ticked, in order, even with a later one ticked', () => {
    expect(currentStep({})?.id).toBe('blind')
    expect(currentStep({ blind: done, shadow: done })?.id).toBe('read')
  })

  it('has no current step once all five are ticked', () => {
    const all = Object.fromEntries(STEPS.map((step) => [step.id, done]))
    expect(currentStep(all)).toBeNull()
  })
})

describe('practiceStatus', () => {
  it('is new while nothing was ticked, timed or heard', () => {
    expect(practiceStatus({}, false)).toBe('new')
    expect(practiceStatus({ blind: { done: false, seconds: 0 } }, false)).toBe('new')
  })

  it('is active once anything happened', () => {
    expect(practiceStatus({}, true)).toBe('active')
    expect(practiceStatus({ blind: timed }, false)).toBe('active')
    expect(practiceStatus({ blind: done }, false)).toBe('active')
  })

  it('is done only when all five are ticked', () => {
    const four = Object.fromEntries(STEPS.slice(0, 4).map((step) => [step.id, done]))
    expect(practiceStatus(four, true)).toBe('active')
    expect(practiceStatus({ ...four, weekly: done }, false)).toBe('done')
  })
})
