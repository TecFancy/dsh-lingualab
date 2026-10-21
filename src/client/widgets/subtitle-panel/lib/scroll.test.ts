// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { bringIntoView, type ScrollList } from './scroll.ts'

function list(scrollTop: number) {
  return { scrollTop, clientHeight: 500, scrollTo: vi.fn<ScrollList['scrollTo']>() } satisfies ScrollList
}

describe('bringIntoView', () => {
  it('leaves a row in the middle band where it is', () => {
    const at = list(1000)
    bringIntoView(at, { offsetTop: 1200, offsetHeight: 40 }, true)
    expect(at.scrollTo).not.toHaveBeenCalled()
  })

  it('centres a row that is out of view, at once for a jump', () => {
    const at = list(0)
    bringIntoView(at, { offsetTop: 4000, offsetHeight: 40 }, false)
    expect(at.scrollTo).toHaveBeenCalledWith({ top: 4000 - 250 + 20, behavior: 'auto' })
  })

  it('glides when following playback, and never scrolls above the top', () => {
    const at = list(3000)
    bringIntoView(at, { offsetTop: 10, offsetHeight: 40 }, true)
    expect(at.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })
})
