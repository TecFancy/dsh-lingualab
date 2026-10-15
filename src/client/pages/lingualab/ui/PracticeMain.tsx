/**
 * The practice view's scroller: the picture, the sentence on stage and the timing strip, in the one column whose room
 * the page measures the picture against.
 *
 * What it works out for itself is what only these three show: whether the sentence is masked (a speaking pause or a
 * review hides the English until it is asked for), the caption of a peek in the large state, and whether the large
 * state hides the sentence altogether.
 */
import type { SubtitleZhMode } from '../../../entities/cue/index.ts'
import { splitCue } from '../../../entities/cue/index.ts'
import type { Translate } from '../../../context.ts'
import type { LibraryState } from '../../../features/library/index.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import { noteHasWord } from '../../../features/notes/index.ts'
import { Stage } from '../../../widgets/practice-stage/index.ts'
import { TimingStrip } from '../../../widgets/timing-editor/index.ts'
import type { StagePhrase } from '../lib/panel.ts'
import { PracticePicture } from './PracticePicture.tsx'
import type { PictureSlot, TimingSlot } from './practice-props.ts'

export interface PracticeMainProps {
  readonly t: Translate
  readonly library: LibraryState
  /** The sentence on stage. */
  readonly activeIndex: number
  readonly zhMode: SubtitleZhMode
  /** The kept phrase of the sentence on stage, when it is kept. */
  readonly stagePhrase: StagePhrase | null
  readonly onToggleWord: (word: string) => void
  /** A review is running, which hides the English until the reader asks for it. */
  readonly reviewOn: boolean
  readonly slot: PictureSlot
  readonly timing: TimingSlot
  /** The scroller's ref callback, which the page measures the picture's room against. */
  readonly onMain: (element: HTMLDivElement | null) => void
}

export function PracticeMain({
  t,
  library,
  activeIndex,
  zhMode,
  stagePhrase,
  onToggleWord,
  reviewOn,
  slot,
  timing,
  onMain,
}: PracticeMainProps) {
  const revealed = useMediaPlayer((state) => state.revealed)
  /** Shadowing hides the English of the sentence being repeated until it has been heard. */
  const shadow = useMediaPlayer((state) => state.pauseAfterSentence)
  const cue = library.cues[activeIndex]
  const lines = cue === undefined ? null : splitCue(cue)
  const { editor, blocked, presence, onRetime } = timing
  const reveal = (): void => useMediaPlayer.getState().reveal(useMediaPlayer.getState().activeIndex)
  const caption = slot.picture === 'large' && slot.sourcePicture && revealed === activeIndex && lines !== null ? lines.english : null
  return (
    <div className="dsh-lingualab-practice-main" ref={onMain}>
      <PracticePicture t={t} slot={slot} caption={caption} />
      {/* Large hides the sentence, because the picture is what is being watched; it only applies while a picture plays. */}
      {slot.picture === 'large' && slot.sourcePicture ? null : (
        <Stage
          t={t}
          cues={library.cues}
          activeIndex={activeIndex}
          zhMode={zhMode}
          masked={(shadow || reviewOn) && cue !== undefined && revealed !== activeIndex}
          onReveal={reveal}
          onToggleWord={onToggleWord}
          hasWord={(word) => noteHasWord(stagePhrase?.phrase?.note ?? '', word)}
          loading={library.cuesLoading}
          hasAudio={library.media !== null}
          onRetime={() => (editor.session === null ? onRetime() : editor.close())}
          retiming={editor.session !== null}
        />
      )}
      <TimingStrip
        t={t}
        editor={editor}
        mounted={presence.mounted}
        shown={presence.shown}
        blocked={
          blocked ??
          (editor.session !== null && (editor.session.cue.origin === undefined || library.tracks.english === null)
            ? t('timingNoSource')
            : null)
        }
      />
    </div>
  )
}
