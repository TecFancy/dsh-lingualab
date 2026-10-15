// @vitest-environment node
/**
 * The hook's callbacks, rendered to a string: the render hands back `arm`, `disarm` and `bookmark`, and calling them
 * outside it runs what they do against the real position cache (over a plain-map `localStorage`) and the real player
 * store. Effects do not run in a string render, so the apply effect and the interval are not exercised here; what they
 * decide is `resume.test.ts`'s.
 */
import type { MutableRefObject, ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import { readAllProgress, readProgress, writeProgress } from '../../../features/resume/index.ts'
import { useResume, type Resume, type ResumeOptions } from './useResume.ts'

const renderToStaticMarkup = render as (element: ReactElement) => string

/** The few `localStorage` members the position cache uses, over a plain map. */
function installStorage(): void {
  const data = new Map<string, string>()
  const storage = {
    get length() {
      return data.size
    },
    key: (index: number) => [...data.keys()][index] ?? null,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  }
  ;(globalThis as unknown as { window: { localStorage: typeof storage } }).window = { localStorage: storage }
}

beforeEach(() => {
  installStorage()
  // The cache pushes to the host through `fetch`; a host that is down must not matter here.
  vi.stubGlobal('fetch', () => Promise.reject(new Error('offline')))
  useMediaPlayer.getState().reset([])
  useMediaPlayer.setState({ currentTime: 42, duration: 600 })
})

afterEach(() => {
  delete (globalThis as unknown as { window?: unknown }).window
  vi.unstubAllGlobals()
})

function setup(over: Partial<ResumeOptions> = {}): { resume: Resume; reviewing: MutableRefObject<boolean> } {
  const reviewing: MutableRefObject<boolean> = { current: false }
  const options: ResumeOptions = {
    view: 'practice',
    episodeId: 'E1',
    segmentId: null,
    element: null,
    cues: [],
    media: null,
    sourceUrl: null,
    finishCount: 0,
    reviewing,
    ...over,
  }
  let resume: Resume | undefined
  function Probe() {
    resume = useResume(options)
    return <span>probe</span>
  }
  renderToStaticMarkup(<Probe />)
  if (resume === undefined) throw new Error('the hook did not render')
  return { resume, reviewing }
}

describe('useResume: the bookmark', () => {
  it('writes the position of the episode on screen', () => {
    const { resume } = setup()
    resume.bookmark()
    expect(readProgress('E1')).toMatchObject({ at: 42, duration: 600 })
  })

  it('writes a segment under its own key', () => {
    const { resume } = setup({ segmentId: '02_b' })
    resume.bookmark()
    expect(readAllProgress()['E1::02_b']).toMatchObject({ at: 42 })
    expect(readProgress('E1')).toBeNull()
  })

  it('writes nothing while no episode is open', () => {
    const { resume } = setup({ episodeId: null })
    resume.bookmark()
    expect(readAllProgress()).toEqual({})
  })

  it('does not overwrite the bookmark a resume is waiting to apply', () => {
    writeProgress('E1', 300, 600)
    const { resume } = setup()
    // The player sits at the start until the resume is applied; that is not where the reader is.
    useMediaPlayer.setState({ currentTime: 5, duration: 600 })
    resume.arm(300, false)
    resume.bookmark()
    expect(readProgress('E1')?.at).toBe(300)
  })

  it('writes again once the resume is withdrawn', () => {
    const { resume } = setup()
    resume.arm(300, false)
    resume.disarm()
    resume.bookmark()
    expect(readProgress('E1')?.at).toBe(42)
  })

  it('treats a request for no seek as no request', () => {
    const { resume } = setup()
    resume.arm(null, false)
    resume.bookmark()
    expect(readProgress('E1')?.at).toBe(42)
  })

  it('does not move 「继续」 to where a review has been', () => {
    const { resume, reviewing } = setup()
    reviewing.current = true
    resume.bookmark()
    expect(readProgress('E1')).toBeNull()
    reviewing.current = false
    resume.bookmark()
    expect(readProgress('E1')?.at).toBe(42)
  })
})

describe('useResume: the stored positions', () => {
  it('hands out what is stored when the page opens', () => {
    writeProgress('E7', 90, 600)
    let seen: Resume | undefined
    function Probe() {
      seen = useResume({
        view: 'home',
        episodeId: null,
        segmentId: null,
        element: null,
        cues: [],
        media: null,
        sourceUrl: null,
        finishCount: 0,
        reviewing: { current: false },
      })
      return <span>probe</span>
    }
    renderToStaticMarkup(<Probe />)
    expect(seen?.progress['E7']).toMatchObject({ at: 90 })
  })
})
