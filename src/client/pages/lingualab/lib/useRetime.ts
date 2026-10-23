/**
 * The timing strip as the page runs it: the editor, how long its panel stays on the page, and what a save does next.
 *
 * The editor widget writes one sentence's timecode through the host and tells the page what moved; what to do after is
 * the page's, because it spans features: the kept sentences follow their sentences (the notes), the subtitles are read
 * again (the library) and the player is put back where it was (the resume). The 「字幕」 popover's save ends the same
 * way, with the files it chose handed out afresh, so its callback lives here too. Which stored phrases follow a save is
 * `retime.ts`'s.
 */
import { useCallback, useMemo } from 'react'
import type { Cue } from '../../../entities/cue/index.ts'
import type { Translate } from '../../../context.ts'
import type { LibraryState } from '../../../features/library/index.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import type { NotesState } from '../../../features/notes/index.ts'
import { usePresence, type Presence } from '../../../shared/lib/usePresence.ts'
import { TIMING_EXIT_MS, useTimingEditor, type SavedTiming, type TimingEditor } from '../../../widgets/timing-editor/index.ts'
import { keptMoves, resumeAfterSave, timingBlockedReason } from './retime.ts'
import type { Resume } from './useResume.ts'

/** What the strip reads from and does to the rest of the page. */
export interface RetimeOptions {
  readonly t: Translate
  readonly library: LibraryState
  readonly notes: NotesState
  readonly cues: readonly Cue[]
  /** The sentence on stage, which the strip opens on. */
  readonly activeIndex: number
  readonly resume: Pick<Resume, 'arm' | 'disarm'>
  /** Close what is over the practice view and drop the picked row, because the strip takes the keyboard. */
  readonly clearOverlays: () => void
}

/** The strip, and what the page needs of it. */
export interface Retime {
  readonly timing: TimingEditor
  /**
   * The layout is in timing mode for as long as the panel is on the page, which outlasts the session by its way out:
   * the card fades while everything around it stays put, and the column leaves timing mode in the commit that unmounts
   * the panel. Behaviour (the keys, the stage's button) follows the session. One presence serves both the column and
   * the panel, so they cannot part by a frame.
   */
  readonly presence: Presence
  /** Why this episode's subtitles cannot be saved from the strip, already translated, or `null`. */
  readonly blocked: string | null
  /** Open the strip for the sentence on stage; layers close, because the strip takes the keyboard. */
  readonly open: () => void
  /**
   * After the 「字幕」 popover saved a choice: open the same episode and segment again, so the host hands out the
   * files the choice resolves to, and stay where the playhead is, as after a timing save. The listing is read again
   * too, so the home's marks say what will play.
   */
  readonly onSubtitlesSaved: () => void
}

/** Drive the timing strip. */
export function useRetime({ t, library, notes, cues, activeIndex, resume, clearOverlays }: RetimeOptions): Retime {
  const { arm, disarm } = resume
  const episode = library.episode
  const episodeId = episode?.id ?? null
  const segmentId = library.segment?.id ?? null

  const blocked = useMemo(
    (): string | null =>
      timingBlockedReason(
        episode?.kind ?? null,
        episode !== null && (library.payload?.files ?? []).some((entry) => entry.id === episode.id),
        t('timingOutside'),
      ),
    [episode, library.payload, t],
  )

  /**
   * After a timing save: keep the star on the sentence, read the file again, and resume where the save
   * left off.
   *
   * A kept sentence is matched by its whole second, so a start that crossed a second would leave
   * the star behind; the phrase's `at` moves with it, and the same for a next sentence whose start
   * the end pushed. Reading the file again gives the cues their
   * new edges and the hash the next save needs. A plain save stays on the sentence the way a replayed
   * note does, looping it when it was playing. A step save goes to the neighbour the panel is about to
   * open, without looping: the panel starts it playing once it is on the new list.
   */
  const onSaved = useCallback(
    (saved: SavedTiming): void => {
      for (const move of keptMoves(saved, notes.phrases, segmentId)) notes.update(move.index, { at: move.at })
      const moving = saved.target !== null
      arm(resumeAfterSave(saved, cues), moving ? false : useMediaPlayer.getState().isPlaying, null)
      library.reloadCues()
    },
    [notes, segmentId, cues, library, arm],
  )

  /** The file changed under the page: read it again and stay where the playhead is. */
  const onStale = useCallback((): void => {
    arm(useMediaPlayer.getState().currentTime, false, null)
    library.reloadCues()
  }, [library, arm])

  const onSubtitlesSaved = useCallback((): void => {
    if (episodeId === null) return
    arm(useMediaPlayer.getState().currentTime, false, null)
    void library.openEpisode(episodeId, segmentId ?? undefined).then((opened) => {
      if (!opened) disarm()
      library.refreshListing()
    })
  }, [episodeId, segmentId, library, arm, disarm])

  const timing = useTimingEditor({ cues, tracks: library.tracks, episodeId, blocked, onSaved, onStale })
  // A save that is moving to the neighbour keeps the panel up across the reload, when the session
  // itself has already ended.
  const presence = usePresence(timing.session !== null || timing.moving, TIMING_EXIT_MS)

  const open = useCallback((): void => {
    if (cues[activeIndex] === undefined) return
    clearOverlays()
    timing.open(activeIndex)
  }, [cues, activeIndex, clearOverlays, timing])

  return { timing, presence, blocked, open, onSubtitlesSaved }
}
