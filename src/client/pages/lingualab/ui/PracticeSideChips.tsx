/**
 * The top bar's two buttons for the right column: the kept chip, which shows the kept sentences, and the toggle that
 * collapses or expands the column.
 *
 * They sit together because they act on the same column. The chip's word is the column's (「收藏」), and in a narrow top
 * bar it drops to its icon and count, so the title keeps its room; its name stays whole for a screen reader.
 */
import type { Translate } from '../../../context.ts'
import { NoteIcon } from '../../../shared/ui/icons.tsx'
import { SideColumnIcon } from '../../../shared/ui/SideColumnIcon.tsx'
import type { SideColumn } from '../lib/useSideColumn.ts'

export interface PracticeSideChipsProps {
  readonly t: Translate
  readonly side: Pick<SideColumn, 'collapsed' | 'keptShown' | 'toggleKept' | 'toggleCollapsed'>
  /** How many sentences are kept. */
  readonly keptCount: number
}

export function PracticeSideChips({ t, side, keptCount }: PracticeSideChipsProps) {
  const kept = t('columnKept')
  const sideLabel = t('keySide')
  return (
    <>
      <button
        type="button"
        className={`dsh-lingualab-chip${side.keptShown ? ' is-on' : ''}`}
        onClick={side.toggleKept}
        title={t('keyColumn')}
        aria-label={keptCount > 0 ? `${kept} ${keptCount}` : kept}
        aria-pressed={side.keptShown}
      >
        <NoteIcon size={13} />
        <span className="dsh-lingualab-chip-text">{kept}</span>
        {keptCount > 0 ? <span>{keptCount}</span> : null}
        <kbd>N</kbd>
      </button>
      <button
        type="button"
        className="dsh-lingualab-icon-btn dsh-lingualab-side-toggle"
        onClick={side.toggleCollapsed}
        title={`${sideLabel} (\\)`}
        aria-label={sideLabel}
        aria-expanded={!side.collapsed}
      >
        <SideColumnIcon size={16} open={!side.collapsed} />
      </button>
    </>
  )
}
