/**
 * The strip above the stage while a review runs: where you are in the queue, and the grades.
 *
 * The sentence itself is on the stage below, its English hidden until you ask for it, and loops
 * there; the strip only says which one of how many it is, where it is from, and offers the three
 * grades, the skip and the way out. The same keys work without it: `1` to `3`, `→`, `Esc`.
 */
import { GRADE_LABELS, gradeKey } from '../../../shared/lib/grades.ts'
import { GIVEN_GRADES, type GivenGrade } from '../../../shared/notes-format.ts'
import { CloseIcon } from '../../../shared/ui/icons.tsx'
import type { Translate } from '../../../context.ts'

export interface ReviewStripProps {
  readonly t: Translate
  /** 1-based place of the sentence on stage in the queue. */
  readonly position: number
  readonly total: number
  /** Where the sentence is from: the episode, and its segment when it has one. */
  readonly source: string
  /** False until the sentence's episode is open and its notes are read, so a grade has somewhere to go. */
  readonly ready: boolean
  readonly onGrade: (grade: GivenGrade) => void
  readonly onSkip: () => void
  readonly onBack: () => void
  readonly onExit: () => void
}

/** The strip. */
export function ReviewStrip({ t, position, total, source, ready, onGrade, onSkip, onBack, onExit }: ReviewStripProps) {
  return (
    <div className="dsh-lingualab-review" role="group" aria-label={t('reviewStart')}>
      <span className="dsh-lingualab-pill">{t('reviewProgress', { n: position, total })}</span>
      <span className="dsh-lingualab-review-source" title={source}>
        {source}
      </span>
      <span className="dsh-lingualab-spacer" />
      {GIVEN_GRADES.map((grade) => (
        <button
          key={grade}
          type="button"
          className={`dsh-lingualab-grade-btn is-${grade}`}
          onClick={() => onGrade(grade)}
          disabled={!ready}
        >
          {t(GRADE_LABELS[grade])} <kbd>{gradeKey(grade)}</kbd>
        </button>
      ))}
      <button type="button" className="dsh-lingualab-pop-btn" onClick={onBack} disabled={position <= 1} title="←">
        {t('reviewBack')}
      </button>
      <button type="button" className="dsh-lingualab-pop-btn" onClick={onSkip} title="→">
        {t('reviewSkip')} <kbd>→</kbd>
      </button>
      <button type="button" className="dsh-lingualab-icon-btn is-small" onClick={onExit} title={`${t('reviewExit')} (Esc)`}>
        <CloseIcon />
      </button>
    </div>
  )
}
