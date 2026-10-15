/**
 * Opening things: the page's one path from a choice to the practice view.
 *
 * Opening an episode, a segment of it or a file from the picker ends the same way: the library opens it, the resume is
 * armed with where to start, and the page switches to the practice view. That is feature-to-feature wiring, which is
 * why it is the page's (the library feature may not reach into the player or the reader's positions); it lives here so
 * that the wiring is written once and each of its callers says only what it wants opened. Putting a kept sentence or a
 * review item on stage is built on it, in `useReplay.ts`.
 *
 * The resume is armed *before* the view switches, so the effect that applies it sees it (`useResume.ts`). Where an
 * open starts, and which segment it opens, are decided by plain functions in `opening.ts`.
 */
import { useCallback } from 'react'
import type { LibraryState } from '../../../features/library/index.ts'
import { readAllProgress, readProgress } from '../../../features/resume/index.ts'
import type { EpisodeEntry } from '../../../shared/protocol.ts'
import { entryOf, segmentToContinue, startPosition } from './opening.ts'
import type { Layer, View } from './panel.ts'
import type { Resume } from './useResume.ts'

/** What the opening reads from and does to the rest of the page. */
export interface OpeningOptions {
  readonly library: LibraryState
  readonly resume: Pick<Resume, 'arm' | 'bookmark' | 'refreshProgress'>
  readonly setView: (view: View) => void
  readonly setLayer: (layer: Layer) => void
  readonly setSelection: (selection: number | null) => void
}

/** What opens things. */
export interface Opening {
  /** The entry for an episode id: from the listing, or the open one when it lives outside it. */
  readonly entryFor: (id: string) => EpisodeEntry | null
  /**
   * Open an episode by id and move to the practice view when the host agrees.
   *
   * For an episode cut into segments this is where 「继续」 is decided, in one place: the segment listened to most
   * recently, or the first when none has been. The host opens whichever it is told, because the host knows no more
   * than the progress file and the page has the reader's positions to hand.
   */
  readonly openEpisode: (id: string) => void
  /** Open a file from the picker and move to the practice view when the host agrees. */
  readonly openFile: (place: string, rel: string) => void
  /**
   * Move to another segment of the open episode.
   *
   * The outgoing segment's position is saved first. The incoming one resumes where it was left unless `to` says where
   * to go, which is what replaying a kept sentence does: it names the second to seek to and asks for the sentence to
   * be looped, and the drawer it came from stays open.
   */
  readonly openSegment: (id: string, to?: { readonly at: number; readonly loop: boolean; readonly text?: string }) => void
}

/** The callbacks that open things. */
export function useOpening({ library, resume, setView, setLayer, setSelection }: OpeningOptions): Opening {
  const { arm, bookmark, refreshProgress } = resume
  const episode = library.episode
  const segmentId = library.segment?.id ?? null

  const entryFor = useCallback(
    (id: string): EpisodeEntry | null => entryOf(library.payload, library.episode, id),
    [library.payload, library.episode],
  )

  const openEpisode = useCallback(
    (id: string): void => {
      void (async () => {
        const entry = entryFor(id)
        const positions = readAllProgress()
        const chosen = segmentToContinue(entry, positions)
        if (!(await library.openEpisode(id, chosen ?? undefined))) return
        // Armed before the view switches, so the effect that applies it sees it.
        const own = chosen === null ? readProgress(id) : null
        arm(startPosition(id, chosen, entry?.segments.map((item) => item.id) ?? [], positions, own), false)
        setSelection(null)
        setLayer('none')
        setView('practice')
      })()
    },
    [library, entryFor, arm, setSelection, setLayer, setView],
  )

  const openFile = useCallback(
    (place: string, rel: string): void => {
      void (async () => {
        if (!(await library.openFile(place, rel))) return
        setSelection(null)
        setLayer('none')
        setView('practice')
      })()
    },
    [library, setSelection, setLayer, setView],
  )

  const openSegment = useCallback(
    (id: string, to?: { readonly at: number; readonly loop: boolean; readonly text?: string }): void => {
      if (episode === null || id === segmentId) return
      void (async () => {
        bookmark()
        if (!(await library.openEpisode(episode.id, id))) return
        const ids = episode.segments.map((item) => item.id)
        const positions = readAllProgress()
        arm(to?.at ?? startPosition(episode.id, id, ids, positions, null), to?.loop === true, to?.text ?? null)
        setSelection(null)
        if (to === undefined) setLayer('none')
        refreshProgress(positions)
      })()
    },
    [episode, segmentId, bookmark, library, arm, setSelection, setLayer, refreshProgress],
  )

  return { entryFor, openEpisode, openFile, openSegment }
}
