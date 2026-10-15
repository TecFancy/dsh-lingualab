/**
 * Putting a kept sentence, or a review item, on stage.
 *
 * A kept sentence is replayed where it is when it is in the segment on screen, and in its own segment otherwise,
 * which is opened first (`useOpening.ts`) and told to loop the sentence once it can seek. A review item may also be in
 * another episode, which is opened the way the home opens one. Which segment to open is `opening.ts`'s; where the
 * sentence is in the cue list on screen is `resume.ts`'s.
 */
import { useCallback } from 'react'
import type { Cue } from '../../../entities/cue/index.ts'
import type { LibraryState } from '../../../features/library/index.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import type { ReviewItem } from '../../../features/review/index.ts'
import type { NotePhrase } from '../../../shared/protocol.ts'
import { otherSegmentToOpen, segmentForItem } from './opening.ts'
import type { View } from './panel.ts'
import { keptCueStart } from './resume.ts'
import type { Opening } from './useOpening.ts'
import type { Resume } from './useResume.ts'

/** What the replay reads from and does to the rest of the page. */
export interface ReplayOptions {
  readonly library: LibraryState
  /** The cue list on screen, which a replayed sentence is looked up in. */
  readonly cues: readonly Cue[]
  readonly resume: Pick<Resume, 'arm'>
  readonly opening: Pick<Opening, 'entryFor' | 'openSegment'>
  readonly setView: (view: View) => void
  readonly setSelection: (selection: number | null) => void
}

/** What puts a sentence on stage. */
export interface Replay {
  /**
   * Replay a kept sentence: seek to it and loop it, opening its segment first when it is in another.
   *
   * A segment the episode no longer has (the file was renamed) cannot be opened, so the sentence is replayed at its
   * second in the one on screen rather than doing nothing.
   */
  readonly replayPhrase: (phrase: NotePhrase) => void
  /**
   * Put one review item on stage: replay it in the open episode, or open its episode (at its segment) first and replay
   * it there, the way a kept sentence from another segment is replayed.
   * @returns false when its episode could not be opened, which the review counts as gone.
   */
  readonly goToItem: (item: ReviewItem) => Promise<boolean>
}

/** The callbacks that replay. */
export function useReplay({ library, cues, resume, opening, setView, setSelection }: ReplayOptions): Replay {
  const { arm } = resume
  const { entryFor, openSegment } = opening
  const episodeId = library.episode?.id ?? null
  const segmentId = library.segment?.id ?? null
  const segments = library.segments

  const replayPhrase = useCallback(
    (phrase: NotePhrase): void => {
      const other = otherSegmentToOpen(phrase, segmentId, segments)
      if (other !== null) {
        openSegment(other, { at: phrase.at, loop: true, text: phrase.text })
        return
      }
      useMediaPlayer.getState().seekCueAt(keptCueStart(cues, phrase.at, phrase.text))
      useMediaPlayer.getState().setLoopMode('sentence')
      // A seek alone leaves paused audio paused, and the card's play icon then did nothing.
      useMediaPlayer.getState().setPlaying(true)
    },
    [cues, segmentId, segments, openSegment],
  )

  const goToItem = useCallback(
    async (item: ReviewItem): Promise<boolean> => {
      if (item.episode === episodeId) {
        // A review started from the home can begin in the episode that is already loaded.
        setSelection(null)
        setView('practice')
        replayPhrase(item.phrase)
        return true
      }
      const segmentOf = segmentForItem(entryFor(item.episode), item.phrase.segment)
      if (!(await library.openEpisode(item.episode, segmentOf))) return false
      arm(item.phrase.at, true, item.phrase.text)
      setSelection(null)
      setView('practice')
      return true
    },
    [episodeId, replayPhrase, entryFor, library, arm, setSelection, setView],
  )

  return { replayPhrase, goToItem }
}
