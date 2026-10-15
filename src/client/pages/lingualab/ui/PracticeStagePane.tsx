/**
 * The practice view's left pane: the picture, the sentence on stage, the transport, and what sits over them (the
 * length warning, the review's strip and summary, the end-of-episode card).
 *
 * It is the part of the page that draws, with nothing of its own to remember: the page owns the player, the notes,
 * the timing session and the review, and hands them in as the objects their hooks return, so a press here calls what
 * the page already had. The pane only lays the parts out, in the order they stack; each part is its own component.
 */
import type { Ref } from 'react'
import type { SubtitleZhMode } from '../../../entities/cue/index.ts'
import type { Translate } from '../../../context.ts'
import type { LibraryState } from '../../../features/library/index.ts'
import type { NotesState } from '../../../features/notes/index.ts'
import type { ControlBarHandle } from '../../../widgets/control-bar/index.ts'
import { VideoNotice, type VideoNoticeData } from '../../../widgets/video-stage/index.ts'
import type { StagePhrase } from '../lib/panel.ts'
import type { ReviewRun } from '../lib/useReviewRun.ts'
import { PracticeDeck } from './PracticeDeck.tsx'
import { PracticeMain } from './PracticeMain.tsx'
import { FinishOverlay, ReviewBar, ReviewSummary, SubtitleError } from './PracticeOverlays.tsx'
import type { DeckSlot, FinishSlot, PictureSlot, TimingSlot } from './practice-props.ts'

export interface PracticeStagePaneProps {
  readonly t: Translate
  readonly library: LibraryState
  readonly notes: NotesState
  readonly review: ReviewRun
  /** The sentence on stage. */
  readonly activeIndex: number
  readonly zhMode: SubtitleZhMode
  readonly onZhMode: (mode: SubtitleZhMode) => void
  /** The kept phrase of the sentence on stage, when it is kept. */
  readonly stagePhrase: StagePhrase | null
  readonly onToggleWord: (word: string) => void
  readonly picture: PictureSlot
  /** The picture has the room it needs above the sentence. */
  readonly pictureFits: boolean
  readonly timing: TimingSlot
  readonly deck: DeckSlot
  /** The transport's handle, which the page's key handler asks to close its menu. */
  readonly controlBar: Ref<ControlBarHandle>
  readonly finish: FinishSlot
  /** The notice over the stage, or `null`. */
  readonly notice: VideoNoticeData | null
  readonly onNoticeAction: () => void
  /** The scroller's ref callback, which the page measures the picture's room against. */
  readonly onMain: (element: HTMLDivElement | null) => void
}

export function PracticeStagePane({
  t,
  library,
  notes,
  review,
  activeIndex,
  zhMode,
  onZhMode,
  stagePhrase,
  onToggleWord,
  picture,
  pictureFits,
  timing,
  deck,
  controlBar,
  finish,
  notice,
  onNoticeAction,
  onMain,
}: PracticeStagePaneProps) {
  return (
    <div
      className={`dsh-lingualab-practice${timing.presence.mounted ? ' is-timing' : ''}${pictureFits ? '' : ' is-picture-squeezed'}`}
    >
      {notice === null ? null : <VideoNotice notice={notice} onAction={onNoticeAction} />}
      <ReviewBar t={t} library={library} review={review} />
      <PracticeMain
        t={t}
        library={library}
        activeIndex={activeIndex}
        zhMode={zhMode}
        stagePhrase={stagePhrase}
        onToggleWord={onToggleWord}
        reviewOn={review.reviewOn}
        slot={picture}
        timing={timing}
        onMain={onMain}
      />
      <PracticeDeck
        t={t}
        library={library}
        notes={notes}
        activeIndex={activeIndex}
        deck={deck}
        controlBar={controlBar}
        zhMode={zhMode}
        onZhMode={onZhMode}
        hasVideoFile={picture.hasVideoFile}
        onRetime={timing.onRetime}
      />
      <SubtitleError t={t} library={library} />
      <ReviewSummary t={t} review={review} />
      {finish.open ? <FinishOverlay t={t} library={library} notes={notes} finish={finish} /> : null}
    </div>
  )
}
