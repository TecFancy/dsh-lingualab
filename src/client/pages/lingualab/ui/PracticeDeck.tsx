/**
 * The transport under the stage, and the line of key caps under it.
 *
 * The transport is the `ControlBar` widget; this hands it the sentence's star (which it works out from the notes: the
 * same whole-second-plus-text match the list's marks use) and the controls the page owns, and lights the caps.
 */
import type { Ref } from 'react'
import { splitCue, type SubtitleZhMode } from '../../../entities/cue/index.ts'
import type { Translate } from '../../../context.ts'
import type { LibraryState } from '../../../features/library/index.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import type { NotesState } from '../../../features/notes/index.ts'
import { ControlBar, type ControlBarHandle } from '../../../widgets/control-bar/index.ts'
import { KeyHints } from '../../../widgets/practice-stage/index.ts'
import type { DeckSlot } from './practice-props.ts'

export interface PracticeDeckProps {
  readonly t: Translate
  readonly library: LibraryState
  readonly notes: NotesState
  /** The sentence on stage. */
  readonly activeIndex: number
  readonly deck: DeckSlot
  /** The transport's handle, which the page's key handler asks to close its menu. */
  readonly controlBar: Ref<ControlBarHandle>
  readonly zhMode: SubtitleZhMode
  readonly onZhMode: (mode: SubtitleZhMode) => void
  /** What is open has a video file, which adds the 「V 画面」 cap. */
  readonly hasVideoFile: boolean
  /** Open the timing strip for the sentence on stage. */
  readonly onRetime: () => void
}

export function PracticeDeck({
  t,
  library,
  notes,
  activeIndex,
  deck,
  controlBar,
  zhMode,
  onZhMode,
  hasVideoFile,
  onRetime,
}: PracticeDeckProps) {
  /** Whether the sentence on stage has a take of the reader's own, which the 「对比」 key plays. */
  const hasTake = useMediaPlayer((state) => state.takes[state.activeIndex] !== undefined)
  const cue = library.cues[activeIndex]
  const kept =
    cue !== undefined && notes.has({ at: cue.start, text: splitCue(cue).english, segment: library.segment?.id ?? undefined })
  return (
    <div className="dsh-lingualab-deck">
      <ControlBar
        ref={controlBar}
        t={t}
        zhMode={zhMode}
        onZhMode={onZhMode}
        kept={kept}
        onToggleKeep={deck.onToggleKeep}
        onRetime={onRetime}
        picture={deck.pictureControl}
        subtitles={deck.subtitleControl}
        disabled={!deck.canPlay || library.cues.length === 0}
      />
      <KeyHints t={t} flash={deck.flashed} active={deck.focused} video={hasVideoFile} compare={hasTake} />
    </div>
  )
}
