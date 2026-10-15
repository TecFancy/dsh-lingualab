// @vitest-environment node
/**
 * The hook's callbacks, rendered to a string: the render hands back the callbacks, and calling them outside it runs the
 * whole open (the library, the position cache, the player store) against fakes for the library and for the page's
 * setters. What is checked is what each open asks of them, and in which order: the resume is armed before the view
 * switches, which is what lets the apply effect see it.
 */
import type { ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Cue } from '../../../entities/cue/index.ts'
import type { LibraryState } from '../../../features/library/index.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import { writeProgress } from '../../../features/resume/index.ts'
import type { ReviewItem } from '../../../features/review/index.ts'
import type { EpisodeEntry, EpisodeSegment, NotePhrase } from '../../../shared/protocol.ts'
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

const cues: Cue[] = [
  { start: 10, end: 12, text: 'One' },
  { start: 20, end: 22, text: 'Two' },
]

const phrase = (at: number, over: Partial<NotePhrase> = {}): NotePhrase => ({
  at,
  text: `line ${String(at)}`,
  zh: '',
  note: '',
  tags: [],
  done: false,
  ...over,
})

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
      cues,
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
  useMediaPlayer.getState().reset(cues)
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

describe('replayPhrase', () => {
  it('seeks to the sentence and loops it in the segment on screen', () => {
    const { opening, log } = setup({ open: episode('E1') })
    opening.replayPhrase(phrase(20, { text: 'Two' }))
    const state = useMediaPlayer.getState()
    expect(state.loopMode).toBe('sentence')
    expect(state.isPlaying).toBe(true)
    expect(state.seekRequest).toBe(20)
    expect(log).toEqual([])
  })

  it('opens the segment of a sentence from another one, to play it there', async () => {
    const { opening, log } = setup({ open: episode('E2', ['01_a', '02_b']), segmentId: '01_a' })
    opening.replayPhrase(phrase(20, { text: 'Two', segment: '02_b' }))
    await flush()
    expect(log).toEqual(['bookmark', 'open:E2:02_b', 'arm:20:true:Two', 'selection:null', 'refresh'])
  })

  it('replays a sentence of a segment that is gone in the one on screen', () => {
    const { opening, log } = setup({ open: episode('E2', ['01_a']), segmentId: '01_a' })
    opening.replayPhrase(phrase(20, { text: 'Two', segment: '09_gone' }))
    expect(log).toEqual([])
    expect(useMediaPlayer.getState().loopMode).toBe('sentence')
  })
})

describe('goToItem', () => {
  const item = (episodeId: string, over: Partial<NotePhrase> = {}): ReviewItem => ({
    episode: episodeId,
    title: `Episode ${episodeId}`,
    phrase: phrase(20, { text: 'Two', ...over }),
  })

  it('replays the sentence in the episode that is already open, without opening anything', async () => {
    const { opening, log, library } = setup({ open: episode('E1') })
    expect(await opening.goToItem(item('E1'))).toBe(true)
    expect(log).toEqual(['selection:null', 'view:practice'])
    expect(library.openEpisode).not.toHaveBeenCalled()
    expect(useMediaPlayer.getState().loopMode).toBe('sentence')
  })

  it('opens another episode at the item\'s segment, arms the sentence to loop, then shows the practice view', async () => {
    const { opening, log } = setup({ listed: [episode('E2', ['01_a', '02_b'])], open: episode('E1') })
    expect(await opening.goToItem(item('E2', { segment: '02_b' }))).toBe(true)
    expect(log).toEqual(['open:E2:02_b', 'arm:20:true:Two', 'selection:null', 'view:practice'])
  })

  it('lets the host pick the segment when the episode no longer has the one the item names', async () => {
    const { opening, log } = setup({ listed: [episode('E2', ['01_a'])], open: episode('E1') })
    expect(await opening.goToItem(item('E2', { segment: '09_gone' }))).toBe(true)
    expect(log[0]).toBe('open:E2:-')
  })

  it('says false, and arms and shows nothing, when the episode cannot be opened', async () => {
    const { opening, log, resume } = setup({ listed: [], open: episode('E1'), opens: false })
    expect(await opening.goToItem(item('E2'))).toBe(false)
    expect(log).toEqual(['open:E2:-'])
    expect(resume.arm).not.toHaveBeenCalled()
  })
})
