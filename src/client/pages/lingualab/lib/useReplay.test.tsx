// @vitest-environment node
/**
 * The hook's callbacks, rendered to a string: the render hands back the callbacks, and calling them outside it runs the
 * replay against fakes for the library and for the page's setters and the real player store. What is checked is what
 * each replay asks of them, and in which order. Which segment a replay opens is `opening.test.ts`'s.
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
import { useOpening } from './useOpening.ts'
import { useReplay, type Replay } from './useReplay.ts'

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

function setup(
  over: { listed?: EpisodeEntry[]; open?: EpisodeEntry | null; segmentId?: string | null; opens?: boolean } = {},
): { replay: Replay; log: string[]; library: { openEpisode: ReturnType<typeof vi.fn> }; resume: { arm: ReturnType<typeof vi.fn> } } {
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
    openFile: vi.fn(),
  }
  const resume = {
    arm: vi.fn((at: number | null, loop: boolean, text?: string | null) =>
      log.push(`arm:${String(at)}:${String(loop)}:${text === undefined ? 'keep' : String(text)}`),
    ),
    bookmark: vi.fn(() => log.push('bookmark')),
    refreshProgress: vi.fn(() => log.push('refresh')),
  }
  const setView = (view: string): void => void log.push(`view:${view}`)
  const setLayer = (layer: string): void => void log.push(`layer:${layer}`)
  const setSelection = (selection: number | null): void => void log.push(`selection:${String(selection)}`)
  let replay: Replay | undefined
  function Probe() {
    const opening = useOpening({ library: library as unknown as LibraryState, resume, setView, setLayer, setSelection })
    replay = useReplay({ library: library as unknown as LibraryState, cues, resume, opening, setView, setSelection })
    return <span>probe</span>
  }
  renderToStaticMarkup(<Probe />)
  if (replay === undefined) throw new Error('the hook did not render')
  return { replay, log, library, resume }
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

describe('replayPhrase', () => {
  it('seeks to the sentence and loops it in the segment on screen', () => {
    const { replay, log } = setup({ open: episode('E1') })
    replay.replayPhrase(phrase(20, { text: 'Two' }))
    const state = useMediaPlayer.getState()
    expect(state.loopMode).toBe('sentence')
    expect(state.isPlaying).toBe(true)
    expect(state.seekRequest).toBe(20)
    expect(log).toEqual([])
  })

  it('opens the segment of a sentence from another one, to play it there', async () => {
    writeProgress('E2::02_b', 33, 600)
    const { replay, log } = setup({ open: episode('E2', ['01_a', '02_b']), segmentId: '01_a' })
    replay.replayPhrase(phrase(20, { text: 'Two', segment: '02_b' }))
    await flush()
    expect(log).toEqual(['bookmark', 'open:E2:02_b', 'arm:20:true:Two', 'selection:null', 'refresh'])
  })

  it('replays a sentence of a segment that is gone in the one on screen', () => {
    const { replay, log } = setup({ open: episode('E2', ['01_a']), segmentId: '01_a' })
    replay.replayPhrase(phrase(20, { text: 'Two', segment: '09_gone' }))
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
    const { replay, log, library } = setup({ open: episode('E1') })
    expect(await replay.goToItem(item('E1'))).toBe(true)
    expect(log).toEqual(['selection:null', 'view:practice'])
    expect(library.openEpisode).not.toHaveBeenCalled()
    expect(useMediaPlayer.getState().loopMode).toBe('sentence')
  })

  it('opens another episode at the item\'s segment, arms the sentence to loop, then shows the practice view', async () => {
    const { replay, log } = setup({ listed: [episode('E2', ['01_a', '02_b'])], open: episode('E1') })
    expect(await replay.goToItem(item('E2', { segment: '02_b' }))).toBe(true)
    expect(log).toEqual(['open:E2:02_b', 'arm:20:true:Two', 'selection:null', 'view:practice'])
  })

  it('lets the host pick the segment when the episode no longer has the one the item names', async () => {
    const { replay, log } = setup({ listed: [episode('E2', ['01_a'])], open: episode('E1') })
    expect(await replay.goToItem(item('E2', { segment: '09_gone' }))).toBe(true)
    expect(log[0]).toBe('open:E2:-')
  })

  it('says false, and arms and shows nothing, when the episode cannot be opened', async () => {
    const { replay, log, resume } = setup({ listed: [], open: episode('E1'), opens: false })
    expect(await replay.goToItem(item('E2'))).toBe(false)
    expect(log).toEqual(['open:E2:-'])
    expect(resume.arm).not.toHaveBeenCalled()
  })
})
