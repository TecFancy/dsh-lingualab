// @vitest-environment node
/**
 * The hook's wiring, rendered to a string: the render gives the callbacks, and calling them outside it runs what
 * they do to the page (a state update after a server render is dropped, so the session itself is not held here; it is
 * `review-run.test.ts`'s). What is checked is what the callbacks hand to the rest of the page, and in which order.
 */
import type { MutableRefObject, ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { EpisodeEntry, NotePhrase, ReviewPayload } from '../../../shared/protocol.ts'
import { useReviewRun, type ReviewRun, type ReviewRunOptions } from './useReviewRun.ts'

const renderToStaticMarkup = render as (element: ReactElement) => string

const phrase = (at: number, over: Partial<NotePhrase> = {}): NotePhrase => ({
  at,
  text: `line ${String(at)}`,
  zh: '',
  note: '',
  tags: [],
  done: false,
  ...over,
})

const EPISODE = { id: 'E1', title: 'Episode one' } as EpisodeEntry

/** Render the hook once with these options and hand back what it returned, plus the calls made to them. */
function setup(over: Partial<ReviewRunOptions> = {}) {
  const log: string[] = []
  const reviewing: MutableRefObject<boolean> = { current: false }
  const goToItem = vi.fn((item: { episode: string; phrase: NotePhrase }) => {
    log.push(`goTo:${item.episode}@${String(item.phrase.at)}`)
    return Promise.resolve(true)
  })
  const options: ReviewRunOptions = {
    episode: EPISODE,
    segments: [],
    notes: { episode: 'E1', phrases: [], update: vi.fn() },
    libraryReview: null,
    goToItem,
    reviewing,
    bookmark: () => log.push(`bookmark:${String(reviewing.current)}`),
    closeLayers: () => log.push(`closeLayers:${String(reviewing.current)}`),
    ...over,
  }
  let run: ReviewRun | undefined
  function Probe() {
    run = useReviewRun(options)
    return <span>probe</span>
  }
  renderToStaticMarkup(<Probe />)
  if (run === undefined) throw new Error('the hook did not render')
  return { run, log, reviewing, options }
}

describe('useReviewRun', () => {
  it('starts with no review on the page', () => {
    const { run } = setup()
    expect(run.review).toBeNull()
    expect(run.reviewItem).toBeNull()
    expect(run.reviewIndex).toBe(-1)
    expect(run.reviewOn).toBe(false)
    expect(run.reviewDone).toBe(false)
  })

  it('does nothing to review an episode when none is open', () => {
    const { run, log, reviewing } = setup({ episode: null, notes: { episode: null, phrases: [phrase(4)], update: vi.fn() } })
    run.reviewEpisode()
    expect(log).toEqual([])
    expect(reviewing.current).toBe(false)
  })

  it('does nothing to review an episode with nothing left to practise', () => {
    const { run, log, reviewing } = setup({ notes: { episode: 'E1', phrases: [phrase(4, { done: true })], update: vi.fn() } })
    run.reviewEpisode()
    expect(log).toEqual([])
    expect(reviewing.current).toBe(false)
  })

  it('writes the position down before it marks the review as running, then closes what is over the page, then opens the first item', () => {
    const { run, log, reviewing } = setup({
      notes: { episode: 'E1', phrases: [phrase(30), phrase(4), phrase(9, { done: true })], update: vi.fn() },
    })
    run.reviewEpisode()
    // The bookmark is skipped while a review runs, so the flag must still be down when it is asked.
    expect(log).toEqual(['bookmark:false', 'closeLayers:true', 'goTo:E1@4'])
    expect(reviewing.current).toBe(true)
  })

  it('reviews the episode\'s segments in the order the episode plays them', () => {
    const { run, log } = setup({
      segments: [{ id: '01_a' }, { id: '02_b' }] as never,
      notes: {
        episode: 'E1',
        phrases: [phrase(5, { segment: '02_b' }), phrase(50, { segment: '01_a' })],
        update: vi.fn(),
      },
    })
    run.reviewEpisode()
    expect(log.at(-1)).toBe('goTo:E1@50')
  })

  it('does nothing to review the library before its list is read', () => {
    const { run, log, reviewing } = setup({ libraryReview: null })
    run.reviewLibrary()
    expect(log).toEqual([])
    expect(reviewing.current).toBe(false)
  })

  it('reviews the library from the first episode the host listed', () => {
    const payload: ReviewPayload = {
      ok: true,
      reason: null,
      total: 3,
      episodes: [
        { episode: 'E2', title: 'Two', kind: 'folder', segments: [], phrases: [phrase(8), phrase(3)] },
        { episode: 'E1', title: 'One', kind: 'folder', segments: [], phrases: [phrase(1)] },
      ],
    }
    const { run, log, reviewing } = setup({ libraryReview: payload })
    run.reviewLibrary()
    expect(log).toEqual(['bookmark:false', 'closeLayers:true', 'goTo:E2@3'])
    expect(reviewing.current).toBe(true)
  })

  it('lowers the running flag when the review ends, so the bookmark writes again', () => {
    const { run, reviewing } = setup()
    reviewing.current = true
    run.endReview()
    expect(reviewing.current).toBe(false)
  })

  it('takes no answer while no review is running', () => {
    const update = vi.fn()
    const { run, log } = setup({ notes: { episode: 'E1', phrases: [phrase(4)], update } })
    run.answerReview('got')
    run.answerReview('skipped')
    expect(update).not.toHaveBeenCalled()
    expect(log).toEqual([])
  })
})
