/**
 * Where the listening is: applying a resume, and writing the position down.
 *
 * A resume is a note to an effect. An event handler that opens something (an episode, a segment, a replayed sentence,
 * a timing save) arms it with a second to seek to, and the effect here consumes it once, as soon as the player can
 * take the seek. It is refs and not state because nothing on screen depends on it: it is read by one effect and by
 * the bookmark, which must not write the player's start position over the one waiting to be applied.
 *
 * The effects keep the order they had in the page. The apply effect has to come after the reset that loading a new cue
 * list triggers (the page's own effect, declared before this hook is called): the reset zeroes the position, and a seek
 * issued before the new source has loaded is discarded by the media binding on purpose, so that a request from the
 * previous episode cannot move the next one. Every open hands back a fresh `media`, so opening an episode that is
 * already loaded re-runs the apply effect too; the library keeps the cue list it has then (it does not parse the same
 * subtitles again), so no reset follows to zero the position the seek has just set.
 *
 * The rules (when a position may be written, where a resume lands) are in `resume.ts`.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { Cue } from '../../../entities/cue/index.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import {
  progressKeyOf,
  readAllProgress,
  readAllSteps,
  startProgressSync,
  writeProgress,
  type PositionTable,
  type Progress,
  type StepsTable,
} from '../../../features/resume/index.ts'
import type { EpisodeMedia } from '../../../shared/protocol.ts'
import type { View } from './panel.ts'
import { canBookmark, canMarkFinished, cuesAreReady, resumeSeek } from './resume.ts'

/** How often the listening position is written down while an episode plays. */
const BOOKMARK_MS = 5000

/** What the resume reads from the page. */
export interface ResumeOptions {
  readonly view: View
  /** The episode on screen, and its segment; the position is stored under their key. */
  readonly episodeId: string | null
  readonly segmentId: string | null
  /** The media element the player drives, `null` until it is on the page. */
  readonly element: HTMLMediaElement | null
  readonly cues: readonly Cue[]
  readonly media: EpisodeMedia | null
  /** What plays; a new source for the same segment (the video that was just prepared) is a swap that re-applies the resume. */
  readonly sourceUrl: string | null
  /** How many times the audio has played to its end, the player store's count. */
  readonly finishCount: number
  /** Whether a review is running; set by the review, read here (see `useReviewRun`). */
  readonly reviewing: MutableRefObject<boolean>
}

/** What the page does with a resume. */
export interface Resume {
  /** Every stored position, as the home and the segment list show them. */
  readonly progress: PositionTable
  /** Every episode's five-step ticks, as the home shows them; read again with the positions. */
  readonly steps: StepsTable
  /** Read the stored positions (and the ticks) again, or take the table just read; the home picks up what changed. */
  readonly refreshProgress: (positions?: PositionTable) => void
  /** Write the position down now (a no-op while a resume is waiting or a review runs). */
  readonly bookmark: () => void
  /**
   * Ask for the player to be put at `at` as soon as it can take the seek, once.
   *
   * `loop` loops that sentence and plays it, as replaying a kept sentence does. `text` is the sentence's English so
   * the seek lands on its cue and not on its whole second; leaving it out keeps the earlier one, which is what
   * opening an episode has always done (a note that was never applied is not cleared by it), and `null` clears it.
   * `at` of `null` asks for nothing.
   */
  readonly arm: (at: number | null, loop: boolean, text?: string | null) => void
  /** Withdraw the request for a seek: whatever it was waiting for did not happen. */
  readonly disarm: () => void
}

/** Hold the resume and the bookmark of the page. */
export function useResume({
  view,
  episodeId,
  segmentId,
  element,
  cues,
  media,
  sourceUrl,
  finishCount,
  reviewing: reviewingRef,
}: ResumeOptions): Resume {
  // The note to the effect below, set in an event handler and consumed once.
  const resumeAt = useRef<number | null>(null)
  /** Whether to loop the sentence at `resumeAt` once it has been seeked to. */
  const resumeLoop = useRef(false)
  /** The English of the replayed note, so the seek lands on its cue rather than on its whole second. */
  const resumeText = useRef<string | null>(null)

  const cuesReady = cuesAreReady(cues.length, media)
  useEffect(() => {
    const target = resumeAt.current
    if (target === null || element === null || !cuesReady) return
    const audio = element
    const apply = (): void => {
      if (resumeAt.current === null) return
      const seek = resumeSeek(resumeAt.current, resumeLoop.current, resumeText.current, cues, audio.duration)
      resumeAt.current = null
      resumeLoop.current = false
      resumeText.current = null
      if (seek === null) return
      useMediaPlayer.getState().seek(seek.at)
      // A loop is only asked for by replaying a kept sentence, which plays it, as in the same segment.
      if (seek.loop) {
        useMediaPlayer.getState().setLoopMode('sentence')
        useMediaPlayer.getState().setPlaying(true)
      }
    }
    if (audio.readyState >= 1) {
      apply()
      return
    }
    audio.addEventListener('loadedmetadata', apply, { once: true })
    return () => audio.removeEventListener('loadedmetadata', apply)
  }, [element, cues, cuesReady, media, sourceUrl])

  const arm = useCallback((at: number | null, loop: boolean, text?: string | null): void => {
    resumeAt.current = at
    resumeLoop.current = loop
    if (text !== undefined) resumeText.current = text
  }, [])
  const disarm = useCallback((): void => {
    resumeAt.current = null
  }, [])

  /** What the position is stored under: the episode's id, or its segment's key. */
  const positionKey = episodeId === null ? null : progressKeyOf(episodeId, segmentId)

  /**
   * Write the listening position down while an episode is on screen.
   *
   * On an interval and on the way out, not on every `timeupdate`: that event fires
   * several times a second, and a `localStorage` write per tick is wasted work for a
   * bookmark nobody reads until the next visit.
   */
  const bookmark = useCallback(() => {
    if (positionKey === null || !canBookmark(resumeAt.current !== null, reviewingRef.current)) return
    const state = useMediaPlayer.getState()
    writeProgress(positionKey, state.currentTime, state.duration)
  }, [positionKey, reviewingRef])

  useEffect(() => {
    if (view !== 'practice') return
    const timer = setInterval(bookmark, BOOKMARK_MS)
    return () => {
      clearInterval(timer)
      bookmark()
    }
  }, [view, bookmark])

  // Audio that plays to its end is finished, and "finished" is read off the stored position
  // being within a second of the length. The five-second interval would usually get there, but
  // not always, so the end of the audio writes it down itself. The count is the store's, which
  // outlives this page, so only a change after mounting counts. The segment list and the home
  // read the table fresh when they open.
  const seenFinishCount = useRef(finishCount)
  useEffect(() => {
    if (finishCount === seenFinishCount.current) return
    seenFinishCount.current = finishCount
    const state = useMediaPlayer.getState()
    if (positionKey !== null && canMarkFinished(view, state.duration, reviewingRef.current)) {
      writeProgress(positionKey, state.duration, state.duration)
    }
  }, [finishCount, positionKey, view, reviewingRef])

  const { progress, steps, refreshProgress } = useStoredProgress()
  return { progress, steps, refreshProgress, bookmark, arm, disarm }
}

/**
 * The stored positions and step ticks, as the home and the segment list show them, shared with the host for as long
 * as the page is open: what another device left arrives here, and the home picks it up the moment it does.
 */
function useStoredProgress(): Pick<Resume, 'progress' | 'steps' | 'refreshProgress'> {
  const [progress, setProgress] = useState<Readonly<Record<string, Progress>>>(() => readAllProgress())
  const [steps, setSteps] = useState<StepsTable>(() => readAllSteps())
  useEffect(
    () =>
      startProgressSync(() => {
        setProgress(readAllProgress())
        setSteps(readAllSteps())
      }),
    [],
  )
  const refreshProgress = useCallback((positions?: PositionTable): void => {
    setProgress(positions ?? readAllProgress())
    setSteps(readAllSteps())
  }, [])
  return { progress, steps, refreshProgress }
}
