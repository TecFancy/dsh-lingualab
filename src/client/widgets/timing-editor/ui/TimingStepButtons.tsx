/**
 * The timing panel's jump buttons: one to the sentence before, one to the next.
 *
 * They are the mouse's way of doing what `↑` and `↓` do inside the panel. They sit in the header,
 * before the close button, and are disabled at the ends of the cue list and while a save is on its
 * way: a changed range that can be saved writes first, then opens the neighbour on the new list.
 */
import type { Translate } from '../../../context.ts'
import { DownIcon } from '../../../shared/ui/DownIcon.tsx'
import { UpIcon } from '../../../shared/ui/icons.tsx'
import type { TimingEditor, TimingSession } from '../model/useTimingEditor.ts'

export interface TimingStepButtonsProps {
  readonly t: Translate
  readonly editor: TimingEditor
  readonly session: TimingSession
  /** Whether a move can happen now; each button is also off at its end of the list. */
  readonly canStep: boolean
}

/** The two neighbour buttons that sit in the panel's header. */
export function TimingStepButtons({ t, editor, session, canStep }: TimingStepButtonsProps) {
  return (
    <>
      <button
        type="button"
        className="dsh-lingualab-icon-btn is-small"
        onClick={() => editor.step(-1)}
        disabled={!canStep || !session.canStepPrevious}
        title={t('prevCue')}
        aria-label={t('prevCue')}
      >
        <UpIcon size={14} />
      </button>
      <button
        type="button"
        className="dsh-lingualab-icon-btn is-small"
        onClick={() => editor.step(1)}
        disabled={!canStep || !session.canStepNext}
        title={t('nextCue')}
        aria-label={t('nextCue')}
      >
        <DownIcon size={14} />
      </button>
    </>
  )
}
