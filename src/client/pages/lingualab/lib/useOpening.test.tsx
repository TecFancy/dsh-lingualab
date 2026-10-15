// @vitest-environment node
/**
 * The hook's callbacks, rendered to a string: the render hands back the callbacks, and calling them outside it runs the
 * whole open (the library, the position cache) against fakes for the library and for the page's setters. What is
 * checked is what each open asks of them, and in which order: the resume is armed before the view switches, which is
 * what lets the apply effect see it. Replaying a sentence is built on it and is `useReplay.test.tsx`'s.
 */
import type { ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LibraryState } from '../../../features/library/index.ts'
import { writeProgress } from '../../../features/resume/index.ts'
import type { EpisodeEntry, EpisodeSegment } from '../../../shared/protocol.ts'
import { useOpening, type Opening } from './useOpening.ts'

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

const segment = (id: string): EpisodeSegment => ({
  id,
  index: 1,
  title: id,
  audio: `${id}.mp3`,
  audioBytes: null,
  subtitleEn: null,
  subtitleZh: null,
  video: null,
})

const episode = (id: string, segmentIds: string[] = []): EpisodeEntry =>
  ({ id, title: `Episode ${id}`, kind: 'folder', segments: segmentIds.map(segment) }) as unknown as EpisodeEntry

/** Let the open's promise chain run. */
const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0))

interface Setup {
  readonly opening: Opening
  readonly log: string[]
  readonly library: { openEpisode: ReturnType<typeof vi.fn>; openFile: ReturnType<typeof vi.fn> }
  readonly resume: { arm: ReturnType<typeof vi.fn>; bookmark: ReturnType<typeof vi.fn>; refreshProgress: ReturnType<typeof vi.fn> }
}

function setup(
  over: {
    listed?: EpisodeEntry[]
    open?: EpisodeEntry | null
    segmentId?: string | null
    opens?: boolean
  } = {},
): Setup {
  const log: string[] = []
  const open = over.open === undefined ? null : over.open
  const library = {
    payload: { episodes: over.listed ?? [], files: [] },
    episode: open,
    segment: over.segmentId === undefined || over.segmentId === null ? null : segment(over.segmentId),
    segments: open?.segments ?? [],
    openEpisode: vi.fn((id: string, segmentOf?: string) => {
      log.push(`open:${id}:${segmentOf ?? '-'}`)
      return Promise.resolve(over.opens ?? true)
    }),
    openFile: vi.fn((place: string, rel: string) => {
      log.push(`file:${place}:${rel}`)
      return Promise.resolve(over.opens ?? true)
    }),
  }
  const resume = {
    arm: vi.fn((at: number | null, loop: boolean, text?: string | null) =>
      log.push(`arm:${String(at)}:${String(loop)}:${text === undefined ? 'keep' : String(text)}`),
    ),
    bookmark: vi.fn(() => log.push('bookmark')),
    refreshProgress: vi.fn(() => log.push('refresh')),
  }
  let opening: Opening | undefined
  function Probe() {
    opening = useOpening({
      library: library as unknown as LibraryState,
      resume,
      setView: (view) => log.push(`view:${view}`),
      setLayer: (layer) => log.push(`layer:${layer}`),
      setSelection: (selection) => log.push(`selection:${String(selection)}`),
    })
    return <span>probe</span>
  }
  renderToStaticMarkup(<Probe />)
  if (opening === undefined) throw new Error('the hook did not render')
  return { opening, log, library, resume }
}

beforeEach(() => {
  installStorage()
  vi.stubGlobal('fetch', () => Promise.reject(new Error('offline')))
})

afterEach(() => {
  delete (globalThis as unknown as { window?: unknown }).window
  vi.unstubAllGlobals()
})

describe('openEpisode', () => {
  it('opens an episode without segments, arms its stored position, then shows the practice view', async () => {
    writeProgress('E1', 75, 600)
    const { opening, log } = setup({ listed: [episode('E1')] })
    opening.openEpisode('E1')
    await flush()
    expect(log).toEqual(['open:E1:-', 'arm:75:false:keep', 'selection:null', 'layer:none', 'view:practice'])
  })

  it('starts an episode with no stored position at the top', async () => {
    const { opening, log } = setup({ listed: [episode('E1')] })
    opening.openEpisode('E1')
    await flush()
    expect(log).toContain('arm:null:false:keep')
  })

  it('opens the segment 「继续」 names, and arms that segment\'s position', async () => {
    writeProgress('E2::02_b', 41, 600)
    const { opening, log } = setup({ listed: [episode('E2', ['01_a', '02_b', '03_c'])] })
    opening.openEpisode('E2')
    await flush()
    expect(log).toEqual(['open:E2:02_b', 'arm:41:false:keep', 'selection:null', 'layer:none', 'view:practice'])
  })

  it('opens the first segment of an episode that has not been listened to', async () => {
    const { opening, log } = setup({ listed: [episode('E2', ['01_a', '02_b'])] })
    opening.openEpisode('E2')
    await flush()
    expect(log[0]).toBe('open:E2:01_a')
  })

  it('opens an episode that is not in the listing, which is open already (a file outside the library)', async () => {
    const { opening, log } = setup({ listed: [], open: episode('file.abc') })
    opening.openEpisode('file.abc')
    await flush()
    expect(log[0]).toBe('open:file.abc:-')
  })

  it('arms nothing and shows nothing when the host does not open it', async () => {
    const { opening, log, resume } = setup({ listed: [episode('E1')], opens: false })
    opening.openEpisode('E1')
    await flush()
    expect(log).toEqual(['open:E1:-'])
    expect(resume.arm).not.toHaveBeenCalled()
  })
})

describe('openFile', () => {
  it('shows the practice view once the host opens the file', async () => {
    const { opening, log } = setup()
    opening.openFile('lib', 'a/b.mp3')
    await flush()
    expect(log).toEqual(['file:lib:a/b.mp3', 'selection:null', 'layer:none', 'view:practice'])
  })

  it('stays where it is when the host does not', async () => {
    const { opening, log } = setup({ opens: false })
    opening.openFile('lib', 'a/b.mp3')
    await flush()
    expect(log).toEqual(['file:lib:a/b.mp3'])
  })
})

describe('openSegment', () => {
  const cut = episode('E2', ['01_a', '02_b'])

  it('does nothing without an open episode, or for the segment already on screen', async () => {
    const none = setup()
    none.opening.openSegment('02_b')
    await flush()
    expect(none.log).toEqual([])

    const same = setup({ open: cut, segmentId: '01_a' })
    same.opening.openSegment('01_a')
    await flush()
    expect(same.log).toEqual([])
  })

  it('saves the outgoing position first, then resumes the incoming segment where it was left', async () => {
    writeProgress('E2::02_b', 33, 600)
    const { opening, log } = setup({ open: cut, segmentId: '01_a' })
    opening.openSegment('02_b')
    await flush()
    expect(log).toEqual(['bookmark', 'open:E2:02_b', 'arm:33:false:null', 'selection:null', 'layer:none', 'refresh'])
  })

  it('keeps the layer it came from open when told where to go, as replaying a kept sentence does', async () => {
    const { opening, log } = setup({ open: cut, segmentId: '01_a' })
    opening.openSegment('02_b', { at: 120, loop: true, text: 'Two' })
    await flush()
    expect(log).toEqual(['bookmark', 'open:E2:02_b', 'arm:120:true:Two', 'selection:null', 'refresh'])
  })

  it('arms nothing when the host does not open it', async () => {
    const { opening, log } = setup({ open: cut, segmentId: '01_a', opens: false })
    opening.openSegment('02_b')
    await flush()
    expect(log).toEqual(['bookmark', 'open:E2:02_b'])
  })
})
