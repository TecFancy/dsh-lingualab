// @vitest-environment node
/**
 * The hook's callbacks, rendered to a string: the render gives the strip and the callbacks around it, and calling them
 * outside it checks what each asks of the library and of the resume. The editor's own saves are the widget's; which
 * stored phrases follow one is `retime.test.ts`'s.
 */
import type { ReactElement } from 'react'
// @ts-expect-error The types for this module are not installed (@types/react-dom), and one function of it is used here.
import { renderToStaticMarkup as render } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { Cue } from '../../../entities/cue/index.ts'
import type { LibraryState } from '../../../features/library/index.ts'
import type { NotesState } from '../../../features/notes/index.ts'
import type { EpisodeEntry } from '../../../shared/protocol.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import { useRetime, type Retime } from './useRetime.ts'

const renderToStaticMarkup = render as (element: ReactElement) => string

const cues: Cue[] = [{ start: 10, end: 12, text: 'One' }]

const folderEpisode = { id: 'E1', kind: 'folder' } as unknown as EpisodeEntry
const looseFile = { id: 'file.abc', kind: 'file' } as unknown as EpisodeEntry

function setup(
  over: { episode?: EpisodeEntry | null; files?: EpisodeEntry[]; segment?: string | null; opens?: boolean; activeIndex?: number } = {},
) {
  const log: string[] = []
  const episode = over.episode === undefined ? folderEpisode : over.episode
  const library = {
    payload: { episodes: [], files: over.files ?? [] },
    episode,
    segment: over.segment === undefined || over.segment === null ? null : { id: over.segment },
    tracks: { english: null, chinese: null },
    openEpisode: vi.fn((id: string, segmentOf?: string) => {
      log.push(`open:${id}:${segmentOf ?? '-'}`)
      return Promise.resolve(over.opens ?? true)
    }),
    refreshListing: vi.fn(() => log.push('refreshListing')),
    reloadCues: vi.fn(),
  } as unknown as LibraryState
  const resume = {
    arm: vi.fn((at: number | null, loop: boolean, text?: string | null) =>
      log.push(`arm:${String(at)}:${String(loop)}:${String(text)}`),
    ),
    disarm: vi.fn(() => log.push('disarm')),
  }
  const clearOverlays = vi.fn(() => log.push('clear'))
  let retime: Retime | undefined
  function Probe() {
    retime = useRetime({
      t: (key) => key,
      library,
      notes: { phrases: [], update: vi.fn() } as unknown as NotesState,
      cues,
      activeIndex: over.activeIndex ?? 0,
      resume,
      clearOverlays,
    })
    return <span>probe</span>
  }
  renderToStaticMarkup(<Probe />)
  if (retime === undefined) throw new Error('the hook did not render')
  return { retime, log, library, clearOverlays }
}

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0))

describe('useRetime', () => {
  it('starts with the strip closed and its panel off the page', () => {
    const { retime } = setup()
    expect(retime.timing.session).toBeNull()
    expect(retime.presence.mounted).toBe(false)
  })

  describe('blocked', () => {
    it('does not block a folder episode', () => {
      expect(setup().retime.blocked).toBeNull()
    })

    it('does not block a loose file the library lists', () => {
      expect(setup({ episode: looseFile, files: [looseFile] }).retime.blocked).toBeNull()
    })

    it('blocks a file from outside the library, with the translated reason', () => {
      expect(setup({ episode: looseFile, files: [] }).retime.blocked).toBe('timingOutside')
    })

    it('does not block while nothing is open', () => {
      expect(setup({ episode: null }).retime.blocked).toBeNull()
    })
  })

  describe('open', () => {
    it('clears what is over the page, then opens the strip', () => {
      const { retime, clearOverlays } = setup()
      retime.open()
      expect(clearOverlays).toHaveBeenCalledTimes(1)
    })

    it('does nothing when there is no sentence on stage', () => {
      const { retime, clearOverlays } = setup({ activeIndex: 5 })
      retime.open()
      expect(clearOverlays).not.toHaveBeenCalled()
    })
  })

  describe('onSubtitlesSaved', () => {
    it('opens the same episode again where the playhead is, then reads the listing again', async () => {
      useMediaPlayer.setState({ currentTime: 42 })
      const { retime, log } = setup()
      retime.onSubtitlesSaved()
      await flush()
      expect(log).toEqual(['arm:42:false:null', 'open:E1:-', 'refreshListing'])
    })

    it('opens the same segment again', async () => {
      const { retime, log } = setup({ segment: '02_b' })
      retime.onSubtitlesSaved()
      await flush()
      expect(log).toContain('open:E1:02_b')
    })

    it('withdraws the resume when the host does not open it, and still reads the listing', async () => {
      useMediaPlayer.setState({ currentTime: 42 })
      const { retime, log } = setup({ opens: false })
      retime.onSubtitlesSaved()
      await flush()
      expect(log).toEqual(['arm:42:false:null', 'open:E1:-', 'disarm', 'refreshListing'])
    })

    it('does nothing while no episode is open', async () => {
      const { retime, log } = setup({ episode: null })
      retime.onSubtitlesSaved()
      await flush()
      expect(log).toEqual([])
    })
  })
})
